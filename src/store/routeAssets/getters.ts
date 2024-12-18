import { FPNumber } from '@sora-substrate/sdk/build';
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
import type { HistoryItem } from '@sora-substrate/sdk';
import type { Asset, AccountAsset, RegisteredAccountAsset } from '@sora-substrate/sdk/build/assets/types';

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
  inputToken(...args): RegisteredAccountAsset {
    const { state, rootGetters } = routeAssetsGetterContext(args);
    const token = rootGetters.assets.assetDataByAddress(state.processingState.inputToken.address);
    const balance = state.processingState.inputTokenBalance;
    if (balance) {
      return { ...token, balance } as RegisteredAccountAsset;
    }
    return token as RegisteredAccountAsset;
  },
  transferTokenBalance:
    (...args) =>
    (address: string | undefined) => {
      if (!address) return FPNumber.ZERO;
      const { state, rootGetters } = routeAssetsGetterContext(args);
      const token = rootGetters.assets.assetDataByAddress(address);
      const balance = state.processingState.transferTokenBalances[address];
      const tokenWithBalance: RegisteredAccountAsset = balance
        ? ({ ...token, balance } as RegisteredAccountAsset)
        : (token as RegisteredAccountAsset);
      return FPNumber.fromCodecValue(getAssetBalance(tokenWithBalance), tokenWithBalance?.decimals);
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
  adarSwapEnabled(...args): boolean {
    const { rootState } = routeAssetsGetterContext(args);
    return !!rootState.settings.featureFlags.adarSwapEnabled;
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
            const swapless = item.useTransfer || item.asset.address === getters.inputToken.address;
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
    const { getters } = routeAssetsGetterContext(args);
    const recipientsWithUsingExistingTokens = getters.recipients
      .filter((item) => item.useTransfer)
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
      const userBalance = getters.transferTokenBalance(asset.address);
      const totalAmount = amount.add(adarFee);
      const amountRequired = totalAmount.sub(userBalance);
      return {
        asset,
        usd: usd,
        amount,
        adarFee: adarFee,
        totalAmount,
        amountRequired: amountRequired,
        userBalance,
      };
    });
  },
  pricesAreUpdated(...args): boolean {
    const { state } = routeAssetsGetterContext(args);
    return state.processingState.pricesAreUpdated;
  },

  recipientsTransfer(...args): Array<Recipient> {
    const { getters } = routeAssetsGetterContext(args);
    return getters.recipients.filter((item) => item.useTransfer || item.asset.address === getters.inputToken.address);
  },

  recipientsSwap(...args): Array<Recipient> {
    const { getters } = routeAssetsGetterContext(args);
    return getters.recipients.filter((item) => !item.useTransfer && item.asset.address !== getters.inputToken.address);
  },

  transferTxsAmountInfo(...args): Array<OutcomeAssetsAmount> {
    const { getters } = routeAssetsGetterContext(args);
    const recipientsWithUsingExistingTokens = getters.recipientsTransfer.map((item) => ({
      symbol: item.asset.symbol,
      ...item,
    }));
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
      const userBalance = getters.transferTokenBalance(asset.address);
      const totalAmount = amount.add(adarFee);
      const amountRequired = totalAmount.sub(userBalance);
      return {
        asset,
        usd: usd,
        amount,
        adarFee,
        totalAmount,
        amountRequired,
        userBalance,
        recipientsNumber: assetArray.length,
      };
    });
  },
  unavailableLiquidityAssetAddresses(...args): Array<string> {
    const { getters } = routeAssetsGetterContext(args);
    const subscriptions = getters.subscriptions;
    return subscriptions
      .filter((item: RouteAssetsSubscription) => !item.isAvailable)
      .map((item: RouteAssetsSubscription) => item.assetAddress);
  },
  isLiquidityUnavailable(...args): boolean {
    const { getters } = routeAssetsGetterContext(args);
    const subscriptions = getters.subscriptions;
    if (!subscriptions.length && getters.recipients.length) return false;
    if (!subscriptions.length) return true;
    return subscriptions.some((item: RouteAssetsSubscription) => !item.isAvailable);
  },

  swapTxsAmountInfo(...args): Array<OutcomeAssetsAmount> {
    const { getters } = routeAssetsGetterContext(args);
    const recipientsWithUsingExistingTokens = getters.recipientsSwap.map((item) => ({
      symbol: item.asset.symbol,
      ...item,
    }));
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
      const userBalance = getters.transferTokenBalance(asset.address);
      const totalAmount = amount.add(adarFee);
      const amountRequired = totalAmount.sub(userBalance);
      return {
        asset,
        usd,
        amount,
        adarFee,
        totalAmount,
        amountRequired,
        userBalance,
        recipientsNumber: assetArray.length,
      };
    });
  },
});

export default getters;
