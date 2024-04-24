/* eslint-disable no-console */
import { assert } from '@polkadot/util';
import { LiquiditySourceTypes } from '@sora-substrate/liquidity-proxy/build/consts';
import { NumberLike } from '@sora-substrate/math';
import { FPNumber } from '@sora-substrate/util/build';
import { Messages } from '@sora-substrate/util/build/logger';
import { api } from '@soramitsu/soraneo-wallet-web';
import { defineActions } from 'direct-vuex';
import { findLast, groupBy } from 'lodash';
import Papa from 'papaparse';
import { firstValueFrom } from 'rxjs';
import { ActionContext } from 'vuex';

import { adarFee } from '@/modules/ADAR/consts';
import { routeAssetsActionContext } from '@/store/routeAssets';
import { delay } from '@/utils';
import { TokenBalanceSubscriptions } from '@/utils/subscriptions';

import { RecipientStatus, SwapTransferBatchStatus } from './types';
import { getTokenEquivalent, getAssetUSDPrice } from './utils';

import type { WhitelistArrayItem, Asset, AccountAsset, AccountBalance } from '@sora-substrate/util/build/assets/types';

enum BalanceSubscriptionKeys {
  adarInputToken = 'adarInputToken',
}

const balanceSubscriptions = new TokenBalanceSubscriptions();

function updateTokenSubscription(context: ActionContext<any, any>): void {
  const { getters, commit, rootGetters } = routeAssetsActionContext(context);
  const { inputToken } = getters;
  const { setInputTokenBalance } = commit;

  const updateBalance = (balance: Nullable<AccountBalance>) => setInputTokenBalance(balance);
  balanceSubscriptions.remove(BalanceSubscriptionKeys.adarInputToken);
  if (
    rootGetters.wallet.account.isLoggedIn &&
    inputToken?.address &&
    !(inputToken.address in rootGetters.wallet.account.accountAssetsAddressTable)
  ) {
    balanceSubscriptions.add(BalanceSubscriptionKeys.adarInputToken, { updateBalance, token: inputToken });
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
  async updateInputTokenSubscription(context): Promise<void> {
    updateTokenSubscription(context);
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
    const { commit, dispatch, rootState } = routeAssetsActionContext(context);
    if (!file) {
      commit.clearData();
      return;
    }
    const assetsTable = rootState.wallet.account.whitelistArray;
    const findAsset = (assetName: string) => {
      return assetsTable.find((item: WhitelistArrayItem) => item.symbol === assetName.toUpperCase());
    };

    const data: Array<any> = [];
    const priceObject = rootState.wallet.account.fiatPriceObject;

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        comments: '//',
        step: (row, parser) => {
          // console.log((row.meta.cursor / file.size) * 100);
          try {
            // const amountInTokens = row.data[4] ? row.data[4].trim().toLowerCase() === 'true' : false;
            // const useTransfer = row.data[5] ? row.data[5].trim().toLowerCase() === 'true' : false;
            const amountInTokens = row.data[4] ? JSON.parse(row.data[4].toLowerCase()) : false;
            const useTransfer = row.data[5] ? JSON.parse(row.data[5].toLowerCase()) : false;
            const csvAmount = row.data[2]?.replace(/,/g, '');
            const asset = findAsset(row.data[3]);
            const amount = amountInTokens
              ? new FPNumber(csvAmount)
              : new FPNumber(csvAmount).div(getAssetUSDPrice(asset, priceObject));
            const usd = amountInTokens
              ? new FPNumber(csvAmount).mul(getAssetUSDPrice(asset, priceObject))
              : new FPNumber(csvAmount);
            data.push({
              name: row.data[0],
              wallet: row.data[1],
              usd: usd,
              asset: asset,
              amount: amount,
              status: api.validateAddress(row.data[1])
                ? RecipientStatus.ADDRESS_VALID
                : RecipientStatus.ADDRESS_INVALID,
              id: (crypto as any).randomUUID(),
              isCompleted: false,
              amountInTokens,
              useTransfer,
            });
          } catch (error) {
            parser.abort();
          }
        },
        complete: ({ errors }) => {
          const allAssetsAreOk = data.every((item) => item.asset);
          if (errors.length < 1 && allAssetsAreOk) {
            resolve();
            commit.setData({ file, recipients: data });
            commit.setTxStatus(SwapTransferBatchStatus.INITIAL);
            dispatch.subscribeOnReserves();
          } else {
            reject(new Error('Parcing failed'));
          }
        },
      });
    });
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
      .map((item: Asset) => item?.address)
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
    const { getters, commit } = routeAssetsActionContext(context);
    const inputAsset = getters.inputToken;
    commit.setTxStatus(SwapTransferBatchStatus.PENDING);
    const data = getters.incompletedRecipients.map((recipient) => {
      commit.setRecipientStatus({
        id: recipient.id,
        status: RecipientStatus.PENDING,
      });
      return getRecipientTransferParams(context, inputAsset, recipient);
    });

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
});

function getRecipientTransferParams(context, inputAsset, recipient) {
  const { rootState, commit } = routeAssetsActionContext(context);
  const priceObject = rootState.wallet.account.fiatPriceObject;
  if (recipient.asset.address === inputAsset.address) {
    const amount = recipient.amountInTokens
      ? new FPNumber(recipient.amount)
      : getTokenEquivalent(priceObject, recipient.asset, recipient.usd);
    const exchangeRate = getAssetUSDPrice(recipient.asset, priceObject);
    commit.setRecipientExchangeRate({ id: recipient.id, rate: exchangeRate });
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

      commit.setRecipientExchangeRate({ id: recipient.id, rate: exchangeRate });

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
// __________________________OLD_________________________________________

// async function executeBatchSwapAndSend(context, data: Array<any>): Promise<any> {
//   const { commit } = routeAssetsActionContext(context);

//   async function processArray(transactions) {
//     for (const tx of transactions) {
//       try {
//         await tx
//           .action()
//           .then(() => {
//             commit.setRecipientStatus({
//               id: tx.recipient.id,
//               status: RecipientStatus.SUCCESS,
//             });
//             commit.setRecipientCompleted(tx.recipient.id);
//           })
//           .catch(() => {
//             commit.setRecipientStatus({
//               id: tx.recipient.id,
//               status: RecipientStatus.FAILED,
//             });
//           });
//       } catch (err) {
//         commit.setRecipientStatus({
//           id: tx.recipient.id,
//           status: RecipientStatus.FAILED,
//         });
//       }
//     }
//   }

//   await processArray(data);
// }
// ______________________________________________________________________

async function executeBatchSwapAndSend(context, data: Array<any>): Promise<any> {
  const { commit, getters, rootCommit, rootState, rootDispatch } = routeAssetsActionContext(context);
  commit.setPricesAreUpdated(false);
  const inputAsset = getters.inputToken;
  const newData = data.map((item) => {
    const targetAmount = item.swapAndSendData.targetAmount;
    return {
      accountId: item.swapAndSendData.address,
      targetAmount,
      assetAddress: item.swapAndSendData.asset.address,
      recipientId: item.recipient.id,
      usd: item.recipient.usd,
      useTransfer: item.recipient.useTransfer && item.recipient.asset.address !== inputAsset.address,
    };
  });
  const groupedData = Object.entries(groupBy(newData, 'assetAddress'));
  const assetsTable = rootState.wallet.account.whitelistArray;
  const findAsset = (assetName: string) => {
    return assetsTable.find((item: WhitelistArrayItem) => item.address === assetName);
  };
  let inputTokenAmount: FPNumber = FPNumber.ZERO;
  const swapTransferData = groupedData.map((entry) => {
    const [outcomeAssetId, receivers] = entry;
    let outcomeAssetReuse = FPNumber.ZERO;
    const approxSum = receivers.reduce((sum, receiver) => {
      if (receiver.useTransfer) {
        outcomeAssetReuse = outcomeAssetReuse.add(receiver.targetAmount);
      }
      return receiver.useTransfer ? sum : sum.add(new FPNumber(receiver.usd));
    }, FPNumber.ZERO);
    const dexIdData = getAmountAndDexId(context, inputAsset, findAsset(outcomeAssetId) as unknown as Asset, approxSum);
    inputTokenAmount = inputTokenAmount.add(dexIdData?.amountFrom);
    const dexId = dexIdData?.bestDexId;
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
  // const params = calcTxParams(inputAsset, maxInputAmount, undefined);
  await withLoading(async () => {
    try {
      await rootDispatch.wallet.transactions.beforeTransactionSign();
      const time = Date.now();
      await api.swap
        .executeSwapTransferBatch(swapTransferData, inputAsset, maxInputAmount)
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
