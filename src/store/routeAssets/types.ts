import { FPNumber } from '@sora-substrate/sdk/build';
import { Asset, AccountAsset, AccountBalance } from '@sora-substrate/sdk/build/assets/types';
import { Subscription } from 'rxjs';

import type { SwapQuote, PrimaryMarketsEnabledAssets } from '@sora-substrate/liquidity-proxy/build/types';
import type { HistoryItem } from '@sora-substrate/sdk';

export type Recipient = {
  name: string;
  wallet: string;
  usd: FPNumber;
  asset: Asset;
  amount?: FPNumber;
  status: string;
  id: string;
  isCompleted?: boolean;
  txId?: string;
  exchangeRate?: FPNumber;
  amountInTokens: boolean;
  useTransfer: boolean;
};

export type RouteAssetsSubscription = {
  isAvailable?: false;
  liquiditySources?: [];
  swapQuote?: SwapQuote;
  assetAddress: string;
  quoteSubscription?: Subscription;
};

export enum RecipientStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  PASSED = 'passed',
  ADDRESS_INVALID = 'addressInvalid',
  ADDRESS_VALID = 'addressValid',
  SUCCESS = 'success',
}

export enum SwapTransferBatchStatus {
  INITIAL = 'Initial',
  PENDING = 'Pending',
  FAILED = 'Failed',
  PASSED = 'Passed',
  SUCCESS = 'Success',
}

export type RoutedToken = {
  token: Asset;
  amount: number;
};

export type TransactionInfo = {
  txId: string;
  blockId: string;
  from: string;
  blockNumber?: string;
};

export type MaxInputAmount = {
  assetSymbol: string;
  amount: FPNumber;
  updateDate: Date;
  totalLiquidityProviderFee: FPNumber;
};

export type MaxInputAmountInfo = {
  totalAmount: FPNumber;
  totalAmountWithFee: FPNumber;
  totalLiquidityProviderFee: FPNumber;
  asetSymbol: string;
};

export type ProcessingState = {
  currentStageIndex: number;
  inputToken: Asset;
  inputTokenBalance: Nullable<AccountBalance>;
  transferTokenBalances: {
    [key: string]: AccountBalance;
  };
  tokensRouted?: Array<RoutedToken>;
  txInfo?: TransactionInfo;
  txHistoryData?: HistoryItem;
  datetime?: Date;
  status: SwapTransferBatchStatus;
  slippageTolerance: string;
  maxInputAmount: MaxInputAmount;
  pricesAreUpdated: boolean;
};

export type Stage = {
  title: string;
  component: string;
};

export type RouteAssetsState = {
  recipients: Array<Recipient>;
  file: Nullable<File>;
  subscriptions: Array<RouteAssetsSubscription>;
  enabledAssetsSubscription?: Nullable<Subscription>;
  processingState: ProcessingState;
  enabledAssets: PrimaryMarketsEnabledAssets;
};

export type PresetSwapData = {
  assetFrom: Asset;
  assetTo: Asset;
  valueTo: FPNumber;
};

export type SummaryAssetRecipientsInfo = {
  recipientsNumber: number;
  asset: Asset | AccountAsset;
  usd: FPNumber;
  usdSwap: FPNumber;
  usdTransfer: FPNumber;
  total: FPNumber;
  totalWithSwap: FPNumber;
  totalWithTransfer: FPNumber;
  required: FPNumber;
  totalTransactions: number;
};

export type OutcomeAssetsAmount = {
  asset: Asset;
  usd: FPNumber;
  amount: FPNumber;
  adarFee: FPNumber;
  totalAmount: FPNumber;
  userBalance: FPNumber;
  amountRequired: FPNumber;
  recipientsNumber?: number;
};
