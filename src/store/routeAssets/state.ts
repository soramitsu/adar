import { FPNumber } from '@sora-substrate/util/build';
import { XOR } from '@sora-substrate/util/build/assets/consts';

import { slippageMultiplier } from '@/modules/ADAR/consts';

import { SwapTransferBatchStatus } from './types';

import type { RouteAssetsState } from './types';

function initialState(): RouteAssetsState {
  return {
    recipients: [],
    file: null,
    subscriptions: [],
    enabledAssetsSubscription: null,
    enabledAssets: {
      tbc: [],
      xst: {},
      // lockedSources: [],
    },
    processingState: {
      currentStageIndex: 0,
      inputToken: XOR,
      datetime: undefined,
      txInfo: undefined,
      status: SwapTransferBatchStatus.INITIAL,
      slippageTolerance: slippageMultiplier,
      pricesAreUpdated: true,
      maxInputAmount: {
        assetSymbol: XOR.symbol,
        amount: FPNumber.ZERO,
        totalLiquidityProviderFee: FPNumber.ZERO,
        updateDate: new Date(),
      },
      txHistoryData: undefined,
    },
  };
}

const state = initialState();

export default state;
