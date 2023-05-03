import type { RouteAssetsState } from './types';
import { XOR } from '@sora-substrate/util/build/assets/consts';

function initialState(): RouteAssetsState {
  return {
    recipients: [],
    file: null,
    subscriptions: [],
    enabledAssetsSubscription: null,
    enabledAssets: {
      tbc: [],
      xst: {},
      lockedSources: [],
    },
    processingState: {
      currentStageIndex: 0,
      inputToken: XOR,
      datetime: undefined,
      txInfo: undefined,
    },
  };
}

const state = initialState();

export default state;
