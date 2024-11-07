<template>
  <RoutingBridge v-if="hasBridgeTxs" />
  <div v-else class="container route-assets-routing-process">
    <div>
      <div v-loading="spinner" class="route-assets-routing-process__spinner">
        <div class="status">
          <s-icon :name="iconName" size="30px" />
        </div>
      </div>
      <div class="route-assets-routing-process__status-text">{{ statusText }}</div>
    </div>
    <div>
      <div v-if="transactionFailed" class="error-message">
        <s-icon class="icon-status" name="basic-clear-X-xs-24" />
        <div>{{ errorMessage }}</div>
      </div>
      <template v-else-if="finalAmount">
        <div class="assets-section">
          <div v-for="(amountInfo, idx) in assetsInfoHistory" :key="idx" class="asset">
            <div class="asset__asset-info">
              <token-logo :token="amountInfo.asset" size="big" />
              <div>
                <div>{{ amountInfo.asset.symbol }}</div>
                <token-address v-bind="amountInfo.asset" class="input-value" />
              </div>
            </div>
            <div class="asset__amount-info">
              <div class="amount">{{ amountInfo.amount }}</div>
              <div class="usd">{{ amountInfo.usd || '' }}</div>
            </div>
          </div>
        </div>
        <info-line :label="amountText" value=" " :fiatValue="totalUSD" />
      </template>
      <div v-else>
        <spinner />
      </div>
    </div>
    <div v-if="!continueButtonDisabled" class="buttons-container">
      <s-button
        type="primary"
        class="s-typography-button--big"
        :disabled="continueButtonDisabled"
        @click.stop="onContinueClick"
      >
        {{ t('adar.routeAssets.continue') }}
      </s-button>
    </div>
  </div>
</template>

<script lang="ts">
import { FPNumber } from '@sora-substrate/util/build';
import { Asset, AccountAsset } from '@sora-substrate/util/build/assets/types';
import { components } from '@soramitsu/soraneo-wallet-web';
import { groupBy } from 'lodash';
import { Component, Mixins } from 'vue-property-decorator';

import BridgeTransactionMixin from '@/components/mixins/BridgeTransactionMixin';
import TranslationMixin from '@/components/mixins/TranslationMixin';
import Spinner from '@/modules/ADAR/components/App/shared/InlineSpinner.vue';
import { getErrorMessage } from '@/modules/ADAR/utils';
import { action, getter } from '@/store/decorators';
import {
  MaxInputAmountInfo,
  OutcomeAssetsAmount,
  SummaryAssetRecipientsInfo,
  SwapTransferBatchStatus,
} from '@/store/routeAssets/types';

import RoutingBridge from './RoutingBridge.vue';

import type { HistoryItem, IBridgeTransaction } from '@sora-substrate/util';

@Component({
  components: {
    TokenLogo: components.TokenLogo,
    Spinner,
    TokenAddress: components.TokenAddress,
    InfoLine: components.InfoLine,
    RoutingBridge,
  },
})
export default class RoutingAssets extends Mixins(TranslationMixin, BridgeTransactionMixin) {
  @action.routeAssets.processingNextStage nextStage!: () => void;
  @getter.routeAssets.inputToken inputToken!: Asset;
  @getter.routeAssets.overallUSDNumber overallUSDNumber!: string;
  @getter.routeAssets.batchTxStatus batchTxStatus!: SwapTransferBatchStatus;
  @getter.routeAssets.maxInputAmount maxInputAmount!: MaxInputAmountInfo;
  @getter.routeAssets.txHistoryData txHistoryData!: HistoryItem;
  @getter.routeAssets.transferTxsAmountInfo transferTxsAmountInfo!: Array<OutcomeAssetsAmount>;
  @getter.routeAssets.swapTxsAmountInfo swapTxsAmountInfo!: Array<OutcomeAssetsAmount>;
  @getter.bridge.historyItem private historyItem!: Nullable<IBridgeTransaction>;
  @getter.routeAssets.recipientsGroupedByToken recipientsGroupedByToken!: (
    asset?: Asset | AccountAsset
  ) => SummaryAssetRecipientsInfo[];

  @getter.routeAssets.hasBridgeTxs hasBridgeTxs!: boolean;

  get continueButtonDisabled() {
    return [SwapTransferBatchStatus.PENDING, SwapTransferBatchStatus.PASSED].includes(this.status);
  }

  onContinueClick() {
    this.nextStage();
  }

  get assetsInfoHistory() {
    if (!this.txHistoryData?.payload?.receivers) return [];
    return Object.values(groupBy(this.txHistoryData?.payload?.receivers, 'symbol')).map((receivers) => {
      const usd = this.recipientsGroupedByToken().find(
        (item) => item.asset.address === receivers[0]?.asset.address
      )?.usd;
      return {
        asset: receivers[0].asset,
        amount: receivers
          .reduce((sum: FPNumber, receiver) => {
            return sum.add(new FPNumber(receiver.amount));
          }, FPNumber.ZERO)
          .toLocaleString(2),
        usd,
      };
    });
  }

  get transactionFailed() {
    return this.batchTxStatus === SwapTransferBatchStatus.FAILED;
  }

  get errorMessage() {
    return getErrorMessage(this.txHistoryData?.errorMessage) ?? '';
  }

  get totalUSD() {
    if (this.transactionFailed) return '0';
    return this.overallUSDNumber;
  }

  get finalAmount() {
    if (this.transactionFailed) return '0';
    return this.txHistoryData?.amount;
  }

  get iconName() {
    return this.status === SwapTransferBatchStatus.SUCCESS ? 'basic-check-marks-24' : 'basic-close-24';
  }

  get statusText() {
    if (this.status === SwapTransferBatchStatus.SUCCESS) return `${this.t('adar.routeAssets.stages.routing.success')}`;
    if (this.status === SwapTransferBatchStatus.PENDING) return `${this.t('adar.routeAssets.stages.routing.pending')}`;
    if (this.status === SwapTransferBatchStatus.PASSED) return `${this.t('adar.routeAssets.stages.routing.passed')}`;
    return `${this.t('adar.routeAssets.stages.routing.failed')}`;
  }

  get amountText() {
    if (this.status === SwapTransferBatchStatus.SUCCESS)
      return `${this.t('adar.routeAssets.stages.routing.amountText.success')}`;
    if (this.status === SwapTransferBatchStatus.PENDING)
      return `${this.t('adar.routeAssets.stages.routing.amountText.pending')}`;
    if (this.status === SwapTransferBatchStatus.PASSED)
      return `${this.t('adar.routeAssets.stages.routing.amountText.passed')}`;
    return `${this.t('adar.routeAssets.stages.routing.amountText.default')}`;
  }

  get spinner() {
    return [SwapTransferBatchStatus.PENDING, SwapTransferBatchStatus.PASSED].includes(this.status);
  }

  get status() {
    return this.batchTxStatus;
  }

  get tx(): Nullable<IBridgeTransaction> {
    return this.historyItem;
  }
}
</script>

<style lang="scss">
.route-assets-routing-process {
  text-align: center;
  font-weight: 300;
  font-feature-settings: 'case' on;

  > *:not(:last-child) {
    margin-bottom: $inner-spacing-big;
  }

  .token-logo {
    > span {
      width: 24px;
      height: 24px;
    }
  }

  &__spinner {
    height: 75px;
    width: 75px;
    margin: 0 auto;
    border-radius: 999px;
    overflow: hidden;
    .status {
      background: color-mix(in srgb, var(--s-color-theme-accent) 20%, transparent);
      height: 100%;
      position: relative;
      // opacity: 0.3;
      i {
        // font-size: 16px !important;
        // display: block;
        color: var(--s-color-theme-accent);
        opacity: 1;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }

  &__status-text {
    font-size: 28px;
    font-weight: 600;
    line-height: 36px;
    letter-spacing: -0.02em;
    text-align: center;
  }
}
</style>

<style scoped lang="scss">
.buttons-container {
  // margin-top: 150px;

  button {
    width: 100%;
    display: block;
    margin: 0;
  }
}

.usd {
  color: var(--s-color-fiat-value);
  &::before {
    content: '$';
    display: inline;
  }
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--s-color-status-error);
  i {
    font-size: 16px !important;
    color: inherit;
  }
}

div.assets-section {
  padding: 8px 16px;
  border-radius: 30px;
  background: var(--s-color-utility-body);
  margin-bottom: 16px;

  /* neo/inset */
  box-shadow: var(--s-shadow-element);

  .asset {
    @include flex-between;
    padding: 12px 0;
    &:not(:last-child) {
      border-bottom: 1px solid var(--s-color-base-border-secondary);
    }
    &__asset-info {
      font-weight: 800;
      font-size: 18px;
      @include flex-start;
      gap: 8px;
      text-align: start;
    }
    &__amount-info {
      text-align: end;

      .amount {
        font-weight: 800;
        font-size: 18px;
      }
    }
  }
}
</style>
