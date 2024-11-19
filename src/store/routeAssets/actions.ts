/* eslint-disable no-console */
import { assert } from '@polkadot/util';
import { LiquiditySourceTypes } from '@sora-substrate/liquidity-proxy/build/consts';
import { NumberLike } from '@sora-substrate/math';
import { FPNumber } from '@sora-substrate/util/build';
import { BridgeNetworkType } from '@sora-substrate/util/build/bridgeProxy/consts';
import { Messages } from '@sora-substrate/util/build/logger';
import { api, vuex as walletVuex, beforeTransactionSign } from '@soramitsu/soraneo-wallet-web';
import { defineActions } from 'direct-vuex';
import { findLast, groupBy } from 'lodash';
import Papa from 'papaparse';
import { firstValueFrom } from 'rxjs';
import { ActionContext } from 'vuex';

import { ZeroStringValue } from '@/consts';
import { adarFee, bridgeWrapperContractAddress } from '@/modules/ADAR/consts';
import { bridgeActionContext } from '@/store/bridge';
import { routeAssetsActionContext } from '@/store/routeAssets';
import { delay, hasInsufficientNativeTokenForFee } from '@/utils';
import ethBridge from '@/utils/bridge/eth';
import { getEthNetworkFee } from '@/utils/bridge/eth/utils';
import ethersUtil from '@/utils/ethers-util';
import { TokenBalanceSubscriptions } from '@/utils/subscriptions';

import { RecipientStatus, SwapTransferBatchStatus, Recipient } from './types';
import { getTokenEquivalent, getAssetUSDPrice } from './utils';

import type { WhitelistArrayItem, Asset, AccountAsset, AccountBalance } from '@sora-substrate/util/build/assets/types';
import type { ParseStepRelult, Parser } from 'papaparse';

enum BalanceSubscriptionKeys {
  adarInputToken = 'adarInputToken',
}

const balanceSubscriptions = new TokenBalanceSubscriptions();

function updateTokenSubscription(context: ActionContext<any, any>, token?: AccountAsset | Asset): void {
  const { getters, commit, rootGetters } = routeAssetsActionContext(context);
  const { setInputTokenBalance, setTransferTokenBalances } = commit;

  const inputToken = token ?? getters.inputToken;

  const updateBalance = token
    ? (balance: Nullable<AccountBalance>) => setTransferTokenBalances({ balance, address: token.address })
    : (balance: Nullable<AccountBalance>) => setInputTokenBalance(balance);
  balanceSubscriptions.remove(inputToken.address);
  if (
    rootGetters.wallet.account.isLoggedIn &&
    inputToken?.address &&
    !(inputToken.address in rootGetters.wallet.account.accountAssetsAddressTable)
  ) {
    balanceSubscriptions.add(inputToken.address, {
      updateBalance,
      token: inputToken as AccountAsset,
    });
  }
}

const actions = defineActions({
  processingNextStage(context) {
    const { commit } = routeAssetsActionContext(context);
    commit.progressCurrentStageIndex(1);
  },
  processingPreviousStage(context) {
    const { commit } = routeAssetsActionContext(context);
    commit.progressCurrentStageIndex(-1);
  },
  setInputToken(context, asset) {
    const { commit, dispatch } = routeAssetsActionContext(context);
    commit.setInputToken(asset);
    dispatch.subscribeOnReserves();
  },
  async updateInputTokenSubscription(context, token?: AccountAsset | Asset): Promise<void> {
    updateTokenSubscription(context, token);
  },
  async resetInputTokenSubscription(context): Promise<void> {
    balanceSubscriptions.remove(BalanceSubscriptionKeys.adarInputToken);
  },
  cancelProcessing(context) {
    const { commit, dispatch } = routeAssetsActionContext(context);
    dispatch.cleanSwapReservesSubscription();
    dispatch.resetInputTokenSubscription();
    commit.clearData();
  },

  async updateRecipients(context, file?: File): Promise<void> {
    const { commit, dispatch, rootState, getters, rootDispatch } = routeAssetsActionContext(context);

    if (!file) {
      commit.clearData();
      return;
    }

    const assetsTable = rootState.wallet.account.whitelistArray;
    const priceObject = rootState.wallet.account.fiatPriceObject;

    const findAsset = (assetName: string) => {
      return assetsTable.find((item: WhitelistArrayItem) => item.symbol === assetName.toUpperCase());
    };

    const processRow = (row: ParseStepRelult) => {
      const amountInTokens = row.data[4] ? JSON.parse(row.data[4].toLowerCase()) : false;
      const useTransfer = row.data[5] ? JSON.parse(row.data[5].toLowerCase()) : false;
      const network = row.data[6] ? 'SEPOLIA' : null;
      const csvAmount = row.data[2]?.replace(/,/g, '');
      const asset = findAsset(row.data[3]);
      const amount = amountInTokens
        ? new FPNumber(csvAmount)
        : new FPNumber(csvAmount).div(getAssetUSDPrice(asset, priceObject));
      const usd = amountInTokens
        ? new FPNumber(csvAmount).mul(getAssetUSDPrice(asset, priceObject))
        : new FPNumber(csvAmount);

      const recipient = {
        name: row.data[0],
        wallet: row.data[1],
        usd: usd,
        asset: asset,
        amount: amount,
        status: api.validateAddress(row.data[1]) ? RecipientStatus.ADDRESS_VALID : RecipientStatus.ADDRESS_INVALID,
        id: (crypto as any).randomUUID(),
        isCompleted: false,
        amountInTokens,
        useTransfer: getters.adarSwapEnabled ? useTransfer : true,
        targetNetwork: network,
      };
      return recipient;
    };

    const parseFile = (): Promise<Array<any>> => {
      return new Promise((resolve, reject) => {
        const resultArray: Array<any> = [];

        Papa.parse(file, {
          header: false,
          skipEmptyLines: true,
          comments: '//',
          step: handleStep(resultArray, reject),
          complete: handleComplete(resultArray, resolve, reject),
        });
      });
    };

    const handleStep = (resultArray, reject) => (row: ParseStepRelult, parser: Parser) => {
      try {
        const processedData = processRow(row);
        resultArray.push(processedData);
      } catch (error) {
        reject(new Error('Parsing aborted due to an error in row processing.'));
      }
    };

    const handleComplete =
      (resultArray, resolve, reject) =>
      ({ errors }) => {
        const allAssetsAreOk = resultArray.every((item) => item?.asset);
        if (errors.length < 1 && allAssetsAreOk) {
          resolve(resultArray);
        } else {
          reject(new Error('Parsing failed due to errors in the CSV file.'));
        }
      };

    try {
      const recipientsData = await parseFile();
      commit.setData({ file, recipients: recipientsData as Array<Recipient> });
      commit.setTxStatus(SwapTransferBatchStatus.INITIAL);
      dispatch.subscribeOnReserves();
      if (getters.externalRecipients.length) {
        commit.setAdarTransactionExternal(true);
      }
    } catch (error) {
      console.error(error);
      return Promise.reject(new Error('Parsing failed'));
    }
  },
  editRecipient(context, { id, name, wallet, usd, asset, amount }): void {
    const { commit } = routeAssetsActionContext(context);
    commit.editRecipient({ id, name, wallet, usd, amount, asset });
  },

  deleteRecipient(context, id): void {
    const { commit } = routeAssetsActionContext(context);
    commit.deleteRecipient(id);
  },

  async subscribeOnReserves(context): Promise<void> {
    const { commit, getters, dispatch } = routeAssetsActionContext(context);
    if (!getters.recipients.length) return;
    dispatch.cleanSwapReservesSubscription();
    dispatch.updateInputTokenSubscription();
    const sourceToken = getters.inputToken;
    const tokens = [...new Set<Asset>(getters.recipients.filter((item) => item.asset).map((item) => item.asset))]
      .map((item: Asset) => {
        dispatch.updateInputTokenSubscription(item);
        return item?.address;
      })
      .filter((item) => item !== sourceToken.address);
    if (!tokens.length && getters.recipients.length) {
      dispatch.updateTokenAmounts();
    }
    if (!tokens || tokens.length < 1) return;

    await api.swap.update();

    const tokensPromises = tokens.map((tokenAddress) => {
      return new Promise<void>((resolve, reject) => {
        const observableQuote = api.swap.getDexesSwapQuoteObservable(sourceToken.address, tokenAddress);
        commit.addSubscription({ assetAddress: tokenAddress, isAvailable: false, liquiditySources: [] });
        if (observableQuote) {
          firstValueFrom(observableQuote).then((quoteData) => {
            dispatch.setSubscriptionPayload({
              data: quoteData,
              outputAssetId: tokenAddress,
            });
            resolve();
          });
        }
      });
    });
    Promise.allSettled(tokensPromises).then(() => {
      dispatch.updateTokenAmounts();
    });
  },

  async setSubscriptionPayload(context, { data, outputAssetId }): Promise<void> {
    const { commit } = routeAssetsActionContext(context);

    const { quote, isAvailable, liquiditySources } = data;

    commit.addSwapQuoteToSubscription({ outputAssetId, swapQuote: quote, isAvailable, liquiditySources });
  },

  updateTokenAmounts(context): void {
    const { rootState, getters, commit, dispatch, state } = routeAssetsActionContext(context);
    const pricesAreUpdated = state.processingState.pricesAreUpdated;
    if (!pricesAreUpdated) return;
    const priceObject = rootState.wallet.account.fiatPriceObject;
    const recipients = getters.recipients;
    recipients.forEach((recipient) => {
      if (!recipient.amountInTokens) {
        const amount = recipient.usd.div(getAssetUSDPrice(recipient.asset, priceObject));
        commit.setRecipientTokenAmount({ id: recipient.id, amount });
      }
    });
    dispatch.updateMaxInputAmount();
  },

  async repeatTransaction(context, id): Promise<void> {
    const { getters, commit, rootCommit } = routeAssetsActionContext(context);
    const inputAsset = getters.inputToken;
    const recipient = getters.recipients.find((recipient) => recipient.id === id);
    if (!recipient) {
      return Promise.reject(new Error('Cant find transaction by this Id'));
    }
    commit.setRecipientStatus({
      id: recipient.id,
      status: RecipientStatus.PENDING,
    });

    const recipientTransferParams = [getRecipientTransferParams(context, inputAsset, recipient)];
    await executeBatchSwapAndSend(context, recipientTransferParams);
  },

  async runAssetsRouting(context): Promise<void> {
    const { getters, commit, dispatch } = routeAssetsActionContext(context);
    const inputAsset = getters.inputToken;
    commit.setTxStatus(SwapTransferBatchStatus.PENDING);
    const data = getters.incompletedRecipients.map((recipient) => {
      commit.setRecipientStatus({
        id: recipient.id,
        status: RecipientStatus.PENDING,
      });
      return getRecipientTransferParams(context, inputAsset, recipient);
    });
    if (getters.isExternalTransaction) {
      await dispatch.runBridgeTransaction();
      return;
    }

    await executeBatchSwapAndSend(context, data);
  },

  cleanSwapReservesSubscription(context): void {
    const { state, commit } = routeAssetsActionContext(context);
    const subscriptions = state.subscriptions;
    subscriptions.forEach((sub) => {
      sub.quoteSubscription?.unsubscribe();
    });
    commit.setSubscriptions([]);
    commit.cleanEnabledAssetsSubscription();
  },

  async getBlockNumber(context, blockId): Promise<string> {
    const apiInstanceAtBlock = await api.api.at(blockId);
    return (await apiInstanceAtBlock.query.system.number()).toString();
  },

  updateMaxInputAmount(context, asset?: Asset | AccountAsset): void {
    const { commit, getters } = routeAssetsActionContext(context);
    const inputAmountAsset = asset || getters.inputToken;
    const recipientsData = getters.recipientsGroupedByToken(inputAmountAsset);
    try {
      const totalAmountData = recipientsData.reduce(
        (acc, item) => {
          const { amountFrom, liquidityProviderFee } = getAmountAndDexId(
            context,
            inputAmountAsset,
            item.asset,
            item.usdSwap
          );
          return {
            totalAmount: acc.totalAmount.add(amountFrom),
            liquidityProviderFee: acc.liquidityProviderFee.add(liquidityProviderFee),
          };
        },
        { totalAmount: FPNumber.ZERO, liquidityProviderFee: FPNumber.ZERO }
      );
      commit.updateMaxInputAmount({
        amount: totalAmountData.totalAmount,
        assetSymbol: inputAmountAsset.symbol.toLowerCase(),
        totalLiquidityProviderFee: totalAmountData.liquidityProviderFee,
      });
    } catch (e) {
      console.groupCollapsed('Subscription Error');
      console.dir(e);
      console.groupEnd();
    }
  },

  // ______________________________________________________________________________________________

  async runBridgeTransaction(context): Promise<void> {
    const { getters, rootGetters } = routeAssetsActionContext(context);

    const { commit: bridgeCommit, dispatch: bridgeDispatch } = bridgeActionContext(context);

    const amount = getters.externalTotalAmount.toString();
    const wallets = rootGetters.routeAssets.externalRecipients.map((item) => item.wallet);
    const amounts = rootGetters.routeAssets.externalRecipients.map((item) => item.amount?.toCodecString() ?? '');

    const tx = await bridgeDispatch.generateHistoryItem({
      payload: { isMultiple: true, recipients: wallets, amounts },
      amount: amount,
      amount2: amount,
      to: bridgeWrapperContractAddress,
    });

    bridgeCommit.setHistoryId(tx.id);
    await ethBridge.handleTransaction(tx.id ?? '');
  },

  async bridgeTransactionsInit(context): Promise<void> {
    const { rootState, commit, getters, dispatch, rootDispatch } = routeAssetsActionContext(context);

    const asset = getters.externalRecipients[0].asset;
    commit.setExternalTxInputToken(asset);
    rootDispatch.bridge.setAssetAddress(asset?.address);

    const amount = getters.externalRecipients.reduce((result, recipient) => {
      return result.add(recipient.amount ?? FPNumber.ZERO);
    }, FPNumber.ZERO);

    const evmAccount = rootState.web3.evmAddress;
    await rootDispatch.web3.selectExternalNetwork({
      id: rootState.web3.ethBridgeEvmNetwork,
      type: BridgeNetworkType.Eth,
    });

    // check connection to account
    const isAccountConnected = await ethersUtil.checkAccountIsConnected(evmAccount);

    if (!isAccountConnected) {
      console.log(`Account for transfer is not connected`);
    }
    rootDispatch.bridge.setSendedAmount(amount.toString());
    await rootDispatch.bridge.updateExternalBalance();
    dispatch.getEvmNetworkFee().then((evmNetworkFee) => {
      commit.setExternalNetworkFee(evmNetworkFee);
    });
  },

  async haveExternalNativeTokenFee(context: ActionContext<any, any>): Promise<boolean> {
    const { getters, rootGetters } = routeAssetsActionContext(context);
    const evmNetworkFee = getters.externalNativeTokenNetworkFee;
    const evmNativeBalance = await ethersUtil.getAccountBalance(rootGetters.bridge.externalAccount);
    return !hasInsufficientNativeTokenForFee(evmNativeBalance, evmNetworkFee);
  },

  markTxSuccessfull(context: ActionContext<any, any>) {
    const { commit, getters } = routeAssetsActionContext(context);
    commit.setTxStatus(SwapTransferBatchStatus.SUCCESS);
    getters.recipients.forEach((reciever) => {
      commit.setRecipientStatus({
        id: reciever.id,
        status: RecipientStatus.SUCCESS,
      });
      commit.setRecipientCompleted(reciever.id);
    });
  },

  async getEvmNetworkFee(context: ActionContext<any, any>): Promise<string> {
    const { getters, state, rootState, rootGetters } = bridgeActionContext(context);
    const { asset, isRegisteredAsset } = getters;
    const { isValidNetwork } = rootGetters.web3;
    const evmAccount = rootState.web3.evmAddress;
    const soraAccount = rootState.wallet.account.address;

    let fee = ZeroStringValue;

    if (asset && isRegisteredAsset && isValidNetwork && evmAccount && soraAccount) {
      const bridgeRegisteredAsset = rootState.assets.registeredAssets[asset.address];
      const decimals = asset.decimals;
      // using max balance to not overflow contract calculation
      const maxAmount = FPNumber.fromCodecValue(state.assetSenderBalance ?? 0, decimals);
      const amount = rootGetters.routeAssets.externalTotalAmount;
      const value = maxAmount.min(amount as FPNumber).toString();
      fee = await getEthNetworkFee(
        asset,
        bridgeRegisteredAsset.kind,
        () => bridgeWrapperContractAddress,
        value,
        true,
        soraAccount,
        evmAccount
      );
    }
    return fee;
  },
});

function getRecipientTransferParams(context, inputAsset, recipient) {
  const { rootState, commit } = routeAssetsActionContext(context);
  const priceObject = rootState.wallet.account.fiatPriceObject;
  if (recipient.asset.address === inputAsset.address) {
    const amount = recipient.amountInTokens
      ? new FPNumber(recipient.amount)
      : getTokenEquivalent(priceObject, recipient.asset, recipient.usd);
    const exchangeRate = getAssetUSDPrice(recipient.asset, priceObject);
    const rate = recipient.useTransfer ? recipient.usd.div(recipient.amount) : exchangeRate;
    commit.setRecipientExchangeRate({ id: recipient.id, rate });
    return {
      recipient,
      swapAndSendData: {
        address: recipient.wallet,
        targetAmount: amount,
        asset: recipient.asset,
      },
    };
  } else {
    try {
      const exchangeRate = getAssetUSDPrice(recipient.asset, priceObject);
      const amountTo = recipient.amountInTokens
        ? new FPNumber(recipient.amount, recipient.asset?.decimals)
        : getTokenEquivalent(priceObject, recipient.asset, recipient.usd);

      const rate = recipient.useTransfer ? recipient.usd.div(recipient.amount) : exchangeRate;

      commit.setRecipientExchangeRate({ id: recipient.id, rate });

      return {
        swapAndSendData: {
          address: recipient.wallet,
          targetAmount: amountTo,
          asset: recipient.asset,
        },
        recipient,
        assetAddress: recipient.asset.address,
      };
    } catch (error: any) {
      throw new Error(error);
    }
  }
}

async function executeBatchSwapAndSend(context, data: Array<any>): Promise<any> {
  const { commit, getters, rootCommit, rootState, rootDispatch } = routeAssetsActionContext(context);
  commit.setPricesAreUpdated(false);
  const inputAsset = getters.inputToken;
  const newData = data.map((item) => {
    const targetAmount = item.swapAndSendData.targetAmount;
    commit.setRecipientTokenAmount({ id: item.recipient.id, amount: targetAmount });
    return {
      accountId: item.swapAndSendData.address,
      targetAmount,
      assetAddress: item.swapAndSendData.asset.address,
      recipientId: item.recipient.id,
      usd: item.recipient.usd,
      useTransfer: item.recipient.useTransfer && item.recipient.asset.address !== inputAsset.address,
      rate: item.recipient.exchangeRate,
    };
  });
  const groupedData = Object.entries(groupBy(newData, 'assetAddress'));
  const assetsTable = rootState.wallet.account.whitelistArray;
  const findAsset = (assetName: string) => {
    return assetsTable.find((item: WhitelistArrayItem) => item.address === assetName);
  };
  let inputTokenAmount: FPNumber = FPNumber.ZERO;
  const rates: any = {};
  const swapTransferData = groupedData.map((entry) => {
    const [outcomeAssetId, receivers] = entry;
    let outcomeAssetReuse = FPNumber.ZERO;
    const approxSum = receivers.reduce((sum, receiver) => {
      if (receiver.useTransfer) {
        outcomeAssetReuse = outcomeAssetReuse.add(receiver.targetAmount);
      }
      return receiver.useTransfer ? sum : sum.add(new FPNumber(receiver.usd));
    }, FPNumber.ZERO);
    const outcomeAsset = findAsset(outcomeAssetId) as unknown as Asset;
    const dexIdData = getAmountAndDexId(context, inputAsset, outcomeAsset, approxSum);
    inputTokenAmount = inputTokenAmount.add(dexIdData?.amountFrom);
    const dexId = dexIdData?.bestDexId;
    rates[outcomeAsset.symbol] = receivers[0].rate.dp(7).toString();
    return {
      outcomeAssetId,
      receivers,
      dexId,
      outcomeAssetReuse: outcomeAssetReuse.add(outcomeAssetReuse.mul(new FPNumber(adarFee).div(FPNumber.HUNDRED))),
    };
  });

  const maxInputAmount = inputTokenAmount.add(
    inputTokenAmount.mul(new FPNumber(getters.slippageTolerance).div(FPNumber.HUNDRED))
  );
  const additionalData = {
    rates,
  };
  await withLoading(async () => {
    try {
      await beforeTransactionSign(walletVuex.walletModules.wallet as any, api);
      const time = Date.now();
      await api.swap
        .executeSwapTransferBatch(swapTransferData, inputAsset, maxInputAmount, additionalData)
        .then(async () => {
          const lastTx = await getLastTransaction(time);
          rootCommit.wallet.transactions.addActiveTx(lastTx.id as string);
          commit.setTxInfo({ txId: lastTx.id, blockId: lastTx.blockId, from: lastTx.from });
          commit.setTxDatetime(new Date());
          swapTransferData.forEach((swapTransferItem) => {
            swapTransferItem.receivers.forEach((receiver) => {
              commit.setRecipientTxId({
                id: receiver.recipientId,
                txId: lastTx.id,
              });
            });
          });
        })
        .catch((err) => {
          console.dir(err);
          commit.setPricesAreUpdated(true);
          commit.setTxStatus(SwapTransferBatchStatus.FAILED);
          swapTransferData.forEach((swapTransferItem) => {
            swapTransferItem.receivers.forEach((receiver) => {
              commit.setRecipientStatus({
                id: receiver.recipientId,
                status: RecipientStatus.FAILED,
              });
            });
          });
        });
    } catch (err) {
      console.dir(err);
      commit.setPricesAreUpdated(true);
      commit.setTxStatus(SwapTransferBatchStatus.FAILED);
      swapTransferData.forEach((swapTransferItem) => {
        swapTransferItem.receivers.forEach((receiver) => {
          commit.setRecipientStatus({
            id: receiver.recipientId,
            status: RecipientStatus.FAILED,
          });
        });
      });
    }
  });
}

async function getLastTransaction(time: number): Promise<any> {
  const tx = findLast(api.historyList as any, (item) => Number(item.startTime) > time);
  if (!tx) {
    await delay();
    return await getLastTransaction(time);
  }
  return tx;
}

let loading = false;

async function withLoading<T = void>(func: FnWithoutArgs<T> | AsyncFnWithoutArgs<T>): Promise<T> {
  loading = true;
  try {
    return await func();
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    loading = false;
  }
}

function calcTxParams(
  asset: Asset | AccountAsset,
  maxAmount: NumberLike,
  liquiditySource = LiquiditySourceTypes.Default
) {
  assert(api.account, Messages.connectWallet);
  const decimals = asset.decimals;
  const amount = FPNumber.fromCodecValue(maxAmount, decimals).toCodecString();
  const liquiditySources = liquiditySource ? [liquiditySource] : [];
  return {
    args: [
      asset.address,
      amount,
      liquiditySources,
      liquiditySource === LiquiditySourceTypes.Default ? 'Disabled' : 'AllowSelected',
    ],
  };
}

function getAmountAndDexId(context: any, assetFrom: Asset, assetTo: Asset, usd: FPNumber) {
  const { rootState, getters, rootGetters, state } = routeAssetsActionContext(context);
  const fiatPriceObject = rootState.wallet.account.fiatPriceObject;
  const tokenEquivalent = getTokenEquivalent(fiatPriceObject, assetTo, usd);
  const exchangeRate = getAssetUSDPrice(assetTo, fiatPriceObject);
  if (assetFrom.address === assetTo.address)
    return {
      amountFrom: tokenEquivalent,
      amountTo: tokenEquivalent,
      liquidityProviderFee: FPNumber.ZERO,
      exchangeRate,
      bestDexId: 0,
    };
  const subscription = getters.subscriptions.find((sub) => sub.assetAddress === assetTo.address);
  if (!subscription?.swapQuote) {
    throw new Error('Subscription did not found');
  }
  const { swapQuote } = subscription;
  const {
    dexId,
    result: { amount, fee },
  } = swapQuote(
    assetFrom.address,
    assetTo.address,
    tokenEquivalent.toString(),
    true,
    [rootGetters.swap.swapLiquiditySource].filter(Boolean) as Array<LiquiditySourceTypes>
  );
  return {
    amountFrom: FPNumber.fromCodecValue(amount),
    amountTo: tokenEquivalent,
    liquidityProviderFee: FPNumber.fromCodecValue(fee),
    exchangeRate,
    bestDexId: dexId,
  };
}

export default actions;
