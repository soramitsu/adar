/* eslint-disable no-console */
import { assert } from '@polkadot/util';
import { LiquiditySourceTypes } from '@sora-substrate/liquidity-proxy/build/consts';
import { NumberLike } from '@sora-substrate/math';
import { FPNumber, Operation } from '@sora-substrate/util/build';
import { XOR } from '@sora-substrate/util/build/assets/consts';
import { Messages } from '@sora-substrate/util/build/logger';
import { api } from '@soramitsu/soraneo-wallet-web';
import { defineActions } from 'direct-vuex';
import { findLast, groupBy } from 'lodash';
import Papa from 'papaparse';

import { routeAssetsActionContext } from '@/store/routeAssets';
import { delay } from '@/utils';

import { RecipientStatus, SwapTransferBatchStatus } from './types';
import { getTokenEquivalent, getAssetUSDPrice } from './utils';

import type { Asset, AccountAsset } from '@sora-substrate/util/build/assets/types';

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
  cancelProcessing(context) {
    const { commit, dispatch } = routeAssetsActionContext(context);
    dispatch.cleanSwapReservesSubscription();
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
      return assetsTable.find((item: Asset) => item.symbol === assetName.toUpperCase());
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
            const amountInTokens = row.data[4] ? row.data[4].trim().toLowerCase() === 'true' : false;
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
            });
          } catch (error) {
            parser.abort();
          }
        },
        complete: ({ errors }) => {
          if (errors.length < 1) {
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

  async subscribeOnReserves(context, tkn: Asset = XOR): Promise<void> {
    const { commit, getters, dispatch } = routeAssetsActionContext(context);
    const sourceToken = getters.inputToken;
    const tokens = [...new Set<Asset>(getters.recipients.filter((item) => item.asset).map((item) => item.asset))]
      .map((item: Asset) => item?.address)
      .filter((item) => item !== sourceToken.address);
    if (!tokens || tokens.length < 1) return;

    dispatch.cleanSwapReservesSubscription();
    const tokensPromises = tokens.map((tokenAddress) => {
      return new Promise<void>((resolve, reject) => {
        api.swap.getDexesSwapQuoteObservable(sourceToken.address, tokenAddress).then((observableQuote) => {
          commit.addSubscription({ assetAddress: tokenAddress });
          const quoteSubscription = observableQuote.subscribe((quoteData) => {
            dispatch.setSubscriptionPayload({
              data: quoteData,
              outputAssetId: tokenAddress,
            });
            resolve();
          });
          commit.addSubscribeObjectToSubscription({ quoteSubscription, outputAssetId: tokenAddress });
        });
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
      const totalAmount = recipientsData.reduce((acc, item) => {
        const { amountFrom } = getAmountAndDexId(context, inputAmountAsset, item.asset, item.usd.toString());
        return acc.add(amountFrom);
      }, FPNumber.ZERO);
      commit.updateMaxInputAmount({ amount: totalAmount, assetSymbol: inputAmountAsset.symbol.toLowerCase() });
    } catch (e) {
      console.log('dexes are not ready');
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
    commit.setRecipientExchangeRate({ id: recipient.id, rate: exchangeRate?.toFixed() });
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
        ? new FPNumber(recipient.amount)
        : getTokenEquivalent(priceObject, recipient.asset, recipient.usd);

      commit.setRecipientExchangeRate({ id: recipient.id, rate: exchangeRate?.toFixed() });

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
    const targetAmount = item.swapAndSendData.targetAmount.toCodecString();
    return {
      accountId: item.swapAndSendData.address,
      targetAmount,
      assetAddress: item.swapAndSendData.asset.address,
      recipientId: item.recipient.id,
      usd: item.recipient.usd,
    };
  });
  const groupedData = Object.entries(groupBy(newData, 'assetAddress'));
  const assetsTable = rootState.wallet.account.whitelistArray;
  const findAsset = (assetName: string) => {
    return assetsTable.find((item: Asset) => item.address === assetName);
  };
  let inputTokenAmount: FPNumber = FPNumber.ZERO;
  const swapTransferData = groupedData.map((entry) => {
    const [outcomeAssetId, receivers] = entry;
    const approxSum = receivers.reduce((sum, receiver) => {
      return sum.add(new FPNumber(receiver.usd));
    }, FPNumber.ZERO);
    const dexIdData = getAmountAndDexId(context, inputAsset, findAsset(outcomeAssetId) as Asset, approxSum.toString());
    inputTokenAmount = inputTokenAmount.add(dexIdData?.amountFrom);
    const dexId = dexIdData?.bestDexId;
    return {
      outcomeAssetId,
      receivers,
      dexId,
    };
  });

  const maxInputAmount = inputTokenAmount
    .add(inputTokenAmount.mul(new FPNumber(getters.slippageTolerance).div(FPNumber.HUNDRED)))
    .toCodecString();
  const params = calcTxParams(inputAsset, maxInputAmount, undefined);
  await withLoading(async () => {
    try {
      await rootDispatch.wallet.transactions.beforeTransactionSign();
      const time = Date.now();
      await api
        .submitExtrinsic(
          (api.api.tx.liquidityProxy as any).swapTransferBatch(swapTransferData, ...params.args),
          api.account.pair,
          {
            symbol: inputAsset.symbol,
            assetAddress: inputAsset.address,
            to: api.account.pair.address,
            type: Operation.SwapAndSend,
          }
        )
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

function getAmountAndDexId(context: any, assetFrom: Asset, assetTo: Asset, usd: number | string) {
  const { rootState, getters, rootGetters, state } = routeAssetsActionContext(context);
  const fiatPriceObject = rootState.wallet.account.fiatPriceObject;
  const tokenEquivalent = getTokenEquivalent(fiatPriceObject, assetTo, usd);
  const exchangeRate = getAssetUSDPrice(assetTo, fiatPriceObject);
  if (assetFrom.address === assetTo.address)
    return { amountFrom: tokenEquivalent, amountTo: tokenEquivalent, exchangeRate, bestDexId: 0 };
  const subscription = getters.subscriptions.find((sub) => sub.assetAddress === assetTo.address);
  if (!subscription?.swapQuote) {
    throw new Error('Subscription did not found');
  }
  const { swapQuote } = subscription;
  const {
    dexId,
    result: { amount },
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
    exchangeRate,
    bestDexId: dexId,
  };
}

export default actions;
