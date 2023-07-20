import { FPNumber } from '@sora-substrate/util/build';
import { api } from '@soramitsu/soraneo-wallet-web';
import { defineGetters } from 'direct-vuex';
import { groupBy, sumBy } from 'lodash';
import { Subscription } from 'rxjs';

import { Stages, slippageMultiplier, adarFee as adarFeeMultiplier } from '@/modules/ADAR/consts';
import { routeAssetsGetterContext } from '@/store/routeAssets';

import { getAssetUSDPrice } from './utils';

import type {
  Recipient,
  RouteAssetsState,
  RouteAssetsSubscription,
  SummaryAssetRecipientsInfo,
  SwapTransferBatchStatus,
  TransactionInfo,
} from './types';
import type { Asset, AccountAsset } from '@sora-substrate/util/build/assets/types';

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
  batchTxStatus(...args): SwapTransferBatchStatus {
    const { state } = routeAssetsGetterContext(args);
    return state.processingState.status;
  },
  overallUSDNumber(...args): string {
    const { state } = routeAssetsGetterContext(args);
    return state.recipients
      .reduce((acc, recipient) => {
        return acc + recipient.usd;
      }, 0)
      .toFixed(2);
  },
  recipientsGroupedByToken:
    (...args) =>
    (asset: Asset | AccountAsset): SummaryAssetRecipientsInfo[] => {
      const { getters, rootState } = routeAssetsGetterContext(args);
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
          required: sumBy(assetArray, (item: Recipient) =>
            new FPNumber(item.usd).div(getAssetUSDPrice(token, priceObject)).toNumber()
          ),
          totalTransactions: assetArray.length,
        };
      });
    },

  overallEstimatedTokens:
    (...args) =>
    (asset) => {
      const { getters } = routeAssetsGetterContext(args);
      const token = asset || getters.inputToken;
      const summaryData = getters.recipientsGroupedByToken(token);
      const totalAmount = summaryData.reduce((acc, item) => {
        return new FPNumber(item.required).add(acc);
      }, FPNumber.ZERO);
      const adarFee = new FPNumber(adarFeeMultiplier).mul(totalAmount);
      const priceImpact = new FPNumber(slippageMultiplier).mul(totalAmount);
      return totalAmount.add(priceImpact).add(adarFee);
    },
});

export default getters;
