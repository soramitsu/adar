import { FPNumber } from '@sora-substrate/util/build';
import { Asset, AccountAsset } from '@sora-substrate/util/build/assets/types';
import { Subscription } from 'rxjs';

import { DexQuoteData } from '../swap/types';

import type { LiquiditySourceTypes } from '@sora-substrate/liquidity-proxy/build/consts';
import type {
  QuotePaths,
  QuotePayload,
  PrimaryMarketsEnabledAssets,
} from '@sora-substrate/liquidity-proxy/build/types';

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
  exchangeRate?: string;
  amountInTokens: boolean;
};

export type RouteAssetsSubscription = {
  liquidityReservesSubscription: Nullable<Subscription>;
  payload: Nullable<QuotePayload>;
  paths: Nullable<QuotePaths>;
  liquiditySources: Nullable<LiquiditySourceTypes[]>;
  assetAddress: string;
  dexId?: number;
  selectedDexId?: number;
  dexQuoteData?: Record<number, DexQuoteData>;
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
};

export type MaxInputAmountInfo = {
  totalAmount: FPNumber;
  totalAmountWithFee: FPNumber;
  asetSymbol: string;
};

export type ProcessingState = {
  currentStageIndex: number;
  inputToken: Asset;
  tokensRouted?: Array<RoutedToken>;
  txInfo?: TransactionInfo;
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
  valueTo: number;
};

export type SummaryAssetRecipientsInfo = {
  recipientsNumber: number;
  asset: Asset | AccountAsset;
  usd: FPNumber;
  total: FPNumber;
  required: FPNumber;
  totalTransactions: number;
};
