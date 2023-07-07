import { FPNumber } from '@sora-substrate/util/build';
import { api } from '@soramitsu/soraneo-wallet-web';
import { defineGetters } from 'direct-vuex';
import { groupBy, sumBy } from 'lodash';
import { Subscription } from 'rxjs';

import { Stages, slippageMultiplier } from '@/modules/ADAR/consts';
import { routeAssetsGetterContext } from '@/store/routeAssets';

import { getAssetUSDPrice } from './utils';

import type { Recipient, RouteAssetsState, RouteAssetsSubscription, TransactionInfo } from './types';
import type { Asset } from '@sora-substrate/util/build/assets/types';

const getters = defineGetters<RouteAssetsState>()({
  recipients(...args): Array<Recipient> {
    const { state } = routeAssetsGetterContext(args);
    return state.recipients;
  },
  validRecipients(...args): Array<Recipient> {
    const { state } = routeAssetsGetterContext(args);
    return state.recipients.filter((recipient) => api.validateAddress(recipient.wallet));
  },
  completedRecipients(...args): Array<Recipient> {
    const { state } = routeAssetsGetterContext(args);
    return state.recipients.filter((recipient) => recipient.isCompleted);
  },
  incompletedRecipients(...args): Array<Recipient> {
    const { state } = routeAssetsGetterContext(args);
    return state.recipients.filter((recipient) => !recipient.isCompleted);
  },
  subscriptions(...args): Array<RouteAssetsSubscription> {
    const { state } = routeAssetsGetterContext(args);
    return state.subscriptions;
  },
  enabledAssetsSubscription(...args): Nullable<Subscription> {
    const { state } = routeAssetsGetterContext(args);
    return state.enabledAssetsSubscription;
  },
  currentStageIndex(...args): number {
    const { state } = routeAssetsGetterContext(args);
    return state.processingState.currentStageIndex;
  },
  currentStageComponentName(...args): string {
    const { state } = routeAssetsGetterContext(args);
    return Stages[state.processingState.currentStageIndex].component;
  },
  currentStageComponentTitle(...args): string {
    const { state } = routeAssetsGetterContext(args);
    return Stages[state.processingState.currentStageIndex].title;
  },
  inputToken(...args): Asset {
    const { state } = routeAssetsGetterContext(args);
    return state.processingState.inputToken;
  },
  file(...args): Nullable<File> {
    const { state } = routeAssetsGetterContext(args);
    return state.file;
  },
  recipientsTokens(...args): Asset[] {
    const { getters, rootGetters } = routeAssetsGetterContext(args);
    const assetsTable = rootGetters.assets.assetsDataTable;
    const addressSet = [...new Set<string>(getters.recipients.map((item) => item.asset.address))];
    return addressSet.map((item) => assetsTable[item]);
  },
  batchTxInfo(...args): Nullable<TransactionInfo> {
    const { state } = routeAssetsGetterContext(args);
    return state.processingState.txInfo;
  },
  batchTxDatetime(...args): Nullable<Date> {
    const { state } = routeAssetsGetterContext(args);
    return state.processingState.datetime;
  },
  overallUSDNumber(...args): number {
    const { state } = routeAssetsGetterContext(args);
    return state.recipients.reduce((acc, recipient) => {
      return acc + recipient.usd;
    }, 0);
  },
  // recipientsGroupedByToken(...args): any {
  //   const { state, getters, rootState } = routeAssetsGetterContext(args);
  //   const priceObject = rootState.wallet.account.fiatPriceObject;
  //   return Object.values(
  //     groupBy(
  //       getters.recipients.map((item) => ({ symbol: item.asset.symbol, ...item })),
  //       'symbol'
  //     )
  //   ).map((assetArray: Array<Recipient>) => {
  //     return {
  //       recipientsNumber: assetArray.length,
  //       asset: assetArray[0].asset,
  //       usd: sumBy(assetArray, (item: Recipient) => Number(item.usd)),
  //       total: sumBy(assetArray, (item: Recipient) => Number(item.amount)),
  //       required:
  //         sumBy(assetArray, (item: Recipient) => Number(item.usd)) / Number(getAssetUSDPrice(getters.inputToken, priceObject)),
  //       totalTransactions: assetArray.length,
  //       // status: this.getStatus(assetArray),
  //     };
  //   });
  // },
  recipientsGroupedByToken:
    (...args) =>
    (asset) => {
      const { state, getters, rootState } = routeAssetsGetterContext(args);
      const priceObject = rootState.wallet.account.fiatPriceObject;
      const token = asset || getters.inputToken;
      return Object.values(
        groupBy(
          getters.recipients.map((item) => ({ symbol: item.asset.symbol, ...item })),
          'symbol'
        )
      ).map((assetArray: Array<Recipient>) => {
        return {
          recipientsNumber: assetArray.length,
          asset: assetArray[0].asset,
          usd: sumBy(assetArray, (item: Recipient) => Number(item.usd)),
          total: sumBy(assetArray, (item: Recipient) => Number(item.amount)),
          required:
            sumBy(assetArray, (item: Recipient) => Number(item.usd)) / Number(getAssetUSDPrice(token, priceObject)),
          totalTransactions: assetArray.length,
          // status: this.getStatus(assetArray),
        };
      });
    },

  overallEstimatedTokens:
    (...args) =>
    (asset) => {
      const { state, getters, rootState } = routeAssetsGetterContext(args);
      const token = asset || getters.inputToken;
      const summaryData = getters.recipientsGroupedByToken(token);
      const sum = new FPNumber(sumBy(summaryData, (item) => item.required));
      return new FPNumber(slippageMultiplier).mul(sum).add(sum);
    },
});

export default getters;
