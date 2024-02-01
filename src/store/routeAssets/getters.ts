import { FPNumber } from '@sora-substrate/util/build';
import { api } from '@soramitsu/soraneo-wallet-web';
import { defineGetters } from 'direct-vuex';
import { groupBy } from 'lodash';
import { Subscription } from 'rxjs';

import { Stages, adarFee as adarFeeMultiplier } from '@/modules/ADAR/consts';
import { routeAssetsGetterContext } from '@/store/routeAssets';
import { getAssetBalance } from '@/utils';

import { getAssetUSDPrice } from './utils';

import type {
  MaxInputAmountInfo,
  OutcomeAssetsAmount,
  Recipient,
  RouteAssetsState,
  RouteAssetsSubscription,
  SummaryAssetRecipientsInfo,
  SwapTransferBatchStatus,
  TransactionInfo,
} from './types';
import type { HistoryItem } from '@sora-substrate/util';
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
    const assetsTable = rootGetters.wallet.account.assetsDataTable;
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
  txHistoryStoreItem(...args): Nullable<HistoryItem> {
    const { state, rootState } = routeAssetsGetterContext(args);
    const txId = state.processingState.txInfo?.txId;
    if (!txId) return null;
    return rootState.wallet.transactions.history[txId];
  },
  txHistoryData(...args): Nullable<HistoryItem> {
    const { state } = routeAssetsGetterContext(args);
    return state.processingState.txHistoryData;
  },
  overallUSDNumber(...args): string {
    const { state } = routeAssetsGetterContext(args);
    return state.recipients
      .reduce((acc, recipient) => {
        return acc.add(new FPNumber(recipient.usd));
      }, FPNumber.ZERO)
      .dp(2)
      .toLocaleString();
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
        const reduceData = assetArray.reduce(
          (acc, item) => {
            const swapless = item.useTransfer && item.asset.address !== token.address;
            return {
              usd: new FPNumber(item.usd).add(acc.usd),
              usdSwap: swapless ? acc.usdSwap : new FPNumber(item.usd).add(acc.usdSwap),
              usdTransfer: swapless ? new FPNumber(item.usd).add(acc.usdTransfer) : acc.usdTransfer,
              total: (item.amount ? new FPNumber(item.amount) : FPNumber.ZERO).add(acc.total),
              totalWithSwap: swapless
                ? acc.totalWithSwap
                : (item.amount ? new FPNumber(item.amount) : FPNumber.ZERO).add(acc.totalWithSwap),
              totalWithTransfer: swapless
                ? (item.amount ? new FPNumber(item.amount) : FPNumber.ZERO).add(acc.totalWithTransfer)
                : acc.totalWithTransfer,
              required: new FPNumber(item.usd).div(getAssetUSDPrice(token, priceObject)).add(acc.required),
            };
          },
          {
            usd: FPNumber.ZERO,
            usdSwap: FPNumber.ZERO,
            usdTransfer: FPNumber.ZERO,
            total: FPNumber.ZERO,
            totalWithSwap: FPNumber.ZERO,
            totalWithTransfer: FPNumber.ZERO,
            required: FPNumber.ZERO,
          }
        );
        const { usd, total, totalWithSwap, totalWithTransfer, required, usdSwap, usdTransfer } = reduceData;
        return {
          recipientsNumber: assetArray.length,
          asset: assetArray[0].asset,
          usd,
          usdSwap,
          usdTransfer,
          total,
          totalWithSwap,
          totalWithTransfer,
          required,
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
        return new FPNumber(item.totalWithSwap).add(acc);
      }, FPNumber.ZERO);
      const adarFee = new FPNumber(adarFeeMultiplier).div(FPNumber.HUNDRED).mul(totalAmount);
      const priceImpact = new FPNumber(getters.slippageTolerance).div(FPNumber.HUNDRED).mul(totalAmount);
      return totalAmount.add(priceImpact).add(adarFee);
    },

  slippageTolerance(...args): string {
    const { state } = routeAssetsGetterContext(args);
    return state.processingState.slippageTolerance;
  },
  maxInputAmount(...args): MaxInputAmountInfo {
    const { state, getters } = routeAssetsGetterContext(args);
    const maxInputAmount = state.processingState.maxInputAmount;
    const totalAmount = maxInputAmount.amount;
    const adarFee = new FPNumber(adarFeeMultiplier).div(FPNumber.HUNDRED).mul(maxInputAmount.amount);
    const priceImpact = new FPNumber(getters.slippageTolerance).div(FPNumber.HUNDRED).mul(maxInputAmount.amount);
    return {
      totalAmount: maxInputAmount.amount,
      totalAmountWithFee: totalAmount.add(priceImpact).add(adarFee),
      asetSymbol: maxInputAmount.assetSymbol,
      totalLiquidityProviderFee: maxInputAmount.totalLiquidityProviderFee,
    };
  },
  outcomeAssetsAmountsList(...args): Array<OutcomeAssetsAmount> {
    const { getters, rootState } = routeAssetsGetterContext(args);
    const recipientsWithUsingExistingTokens = getters.recipients
      .filter((item) => item.useTransfer && item.asset.address !== getters.inputToken.address)
      .map((item) => ({ symbol: item.asset.symbol, ...item }));
    return Object.values(groupBy(recipientsWithUsingExistingTokens, 'symbol')).map((assetArray: Array<Recipient>) => {
      const reduceData = assetArray.reduce(
        (acc, item) => {
          return {
            usd: new FPNumber(item.usd).add(acc.usd),
            totalAmount: (item.amount ? new FPNumber(item.amount) : FPNumber.ZERO).add(acc.totalAmount),
          };
        },
        {
          usd: FPNumber.ZERO,
          totalAmount: FPNumber.ZERO,
        }
      );
      const { usd, totalAmount: amount } = reduceData;
      const adarFee = new FPNumber(adarFeeMultiplier).div(FPNumber.HUNDRED).mul(amount);
      const asset = assetArray[0].asset;
      const accountAsset = rootState.wallet.account.accountAssets.find((item) => item.address === asset.address);
      const userBalance = FPNumber.fromCodecValue(getAssetBalance(accountAsset), accountAsset?.decimals);
      const totalAmount = amount.add(adarFee);
      const amountRequired = totalAmount.sub(userBalance);
      return {
        asset,
        usd: usd,
        amount: totalAmount,
        adarFee: adarFee,
        totalAmount: totalAmount.add(adarFee),
        amountRequired: amountRequired,
        userBalance: userBalance,
      };
    });
  },
  pricesAreUpdated(...args): boolean {
    const { state } = routeAssetsGetterContext(args);
    return state.processingState.pricesAreUpdated;
  },
});

export default getters;
