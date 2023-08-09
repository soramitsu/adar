<template>
  <div class="container route-assets-routing-process">
    <div>
      <div v-loading="spinner" class="route-assets-routing-process__spinner">
        <div class="status">
          <s-icon :name="iconName" size="30px" />
        </div>
      </div>
      <div class="route-assets-routing-process__status-text">{{ statusText }}</div>
    </div>
    <div class="fields-container">
      <div class="field">
        <div class="field__label">{{ t('adar.routeAssets.inputAsset') }}</div>
        <div class="field__value">
          <div>{{ inputToken.symbol }}</div>
          <div>
            <token-logo class="token-logo" :token="inputToken" />
          </div>
        </div>
      </div>
      <s-divider />
      <div class="field">
        <div class="field__label">{{ amountText }}</div>
        <div class="field__value">
          {{ tokensEstimate }} <span>{{ inputToken.symbol.toUpperCase() }}</span>
          <span class="usd">{{ overallUSDNumber }}</span>
        </div>
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
import { Component, Mixins } from 'vue-property-decorator';

import TranslationMixin from '@/components/mixins/TranslationMixin';
import { action, getter } from '@/store/decorators';
import { MaxInputAmountInfo, Recipient, SwapTransferBatchStatus } from '@/store/routeAssets/types';
@Component({
  components: {
    TokenLogo: components.TokenLogo,
  },
})
export default class RoutingAssets extends Mixins(TranslationMixin) {
  @action.routeAssets.processingNextStage nextStage!: any;
  @getter.routeAssets.recipients private recipients!: Array<Recipient>;
  @getter.routeAssets.recipientsTokens recipientsTokens!: Asset[];
  @getter.routeAssets.inputToken inputToken!: Asset;
  @getter.routeAssets.overallEstimatedTokens overallEstimatedTokens!: (asset?: AccountAsset) => FPNumber;
  @getter.routeAssets.overallUSDNumber overallUSDNumber!: string;
  @getter.routeAssets.batchTxStatus batchTxStatus!: SwapTransferBatchStatus;
  @getter.routeAssets.maxInputAmount maxInputAmount!: MaxInputAmountInfo;

  get continueButtonDisabled() {
    return [SwapTransferBatchStatus.PENDING, SwapTransferBatchStatus.PASSED].includes(this.status);
  }

  onContinueClick() {
    this.nextStage();
  }

  get tokensEstimate() {
    return this.maxInputAmount.totalAmountWithFee?.toLocaleString();
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
.fields-container {
  .field {
    &__label {
      &_failed {
        color: var(--s-color-status-error);
        font-weight: 600;
        fill: var(--s-color-status-error);
        &::after {
          margin-left: 4px;
          content: '✕';
          display: inline;
          color: var(--s-color-status-error);
        }
      }
      &_routed {
        color: var(--s-color-status-success);
        font-weight: 600;
        fill: var(--s-color-status-success);
        &::after {
          margin-left: 4px;
          content: '✓';
          display: inline;
          color: var(--s-color-status-success);
        }
      }
      &_waiting,
      &_passed {
        color: var(--s-color-status-warning);
        font-weight: 600;
        fill: var(--s-color-status-warning);
        &::after {
          margin-left: 4px;
          content: '...';
          display: inline;
          color: var(--s-color-status-warning);
        }
      }
    }
  }
}

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
    content: '~ $';
    display: inline;
  }
}
</style>
