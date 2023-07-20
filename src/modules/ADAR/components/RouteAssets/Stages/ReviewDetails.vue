<template>
  <div class="route-assets-review-details">
    <div class="container review-details-section">
      <div class="route-assets__page-header-title">{{ t('adar.routeAssets.stages.reviewDetails.title') }}</div>
      <div class="route-assets__page-header-description">
        {{ t('adar.routeAssets.stages.reviewDetails.description') }}
      </div>
      <div class="fields-container">
        <div class="field">
          <div class="field__label">{{ t('adar.routeAssets.inputAsset') }}</div>
          <div
            class="field__value pointer"
            @click="
              () => {
                showSelectInputAssetDialog = true;
              }
            "
          >
            <div>{{ inputToken.symbol }}</div>
            <div>
              <token-logo class="token-logo" :token="inputToken" />
            </div>
            <div>
              <s-icon name="arrows-chevron-down-rounded-24" size="20" />
            </div>
          </div>
        </div>
        <s-divider />
        <div class="field">
          <div class="field__label">{{ t('adar.routeAssets.totalUsdToRoute') }}</div>
          <div class="field__value usd">{{ usdToBeRouted }}</div>
        </div>
        <s-divider />
        <div class="field">
          <div class="field__label">
            {{ t('adar.routeAssets.stages.reviewDetails.adarFee', { adarFee: adarFeePercent }) }}
          </div>
          <div class="field__value">
            {{ formatNumber(adarFee) }} <token-logo class="token-logo" :token="inputToken" />
          </div>
        </div>
        <s-divider />
        <div class="field">
          <div class="field__label">{{ t('adar.routeAssets.stages.reviewDetails.networkFee') }}</div>
          <div class="field__value">{{ formatNumber(networkFee) }} <token-logo class="token-logo" :token="xor" /></div>
        </div>
        <s-divider />
        <div class="field">
          <div class="field__label">
            {{ t('adar.routeAssets.stages.reviewDetails.priceImpact', { priceImpact: priceImpactPercent }) }}
          </div>
          <div class="field__value">
            {{ formatNumber(estimatedPriceImpact) }} <token-logo class="token-logo" :token="inputToken" />
          </div>
        </div>
        <s-divider />
        <div class="field">
          <div class="field__label">{{ t('adar.routeAssets.totalTokensRequired') }}</div>
          <div class="field__value">
            {{ formatNumber(estimatedAmountWithFees) }} <token-logo class="token-logo" :token="inputToken" />
          </div>
        </div>
        <s-divider />
        <div class="field">
          <div class="field__label">{{ t('adar.routeAssets.stages.reviewDetails.tokensAvailable') }}</div>
          <div class="field__value">
            {{ totalTokensAvailable }} <token-logo class="token-logo" :token="inputToken" />
          </div>
          <warning-message
            class="warning-message"
            :text="
              noIssues
                ? `${t('adar.routeAssets.stages.reviewDetails.okBalance')}`
                : `${t('adar.routeAssets.stages.reviewDetails.badBalance')}`
            "
            :isError="!noIssues"
          />
        </div>
        <template v-if="!noIssues">
          <s-divider />
          <div class="field">
            <div class="field__label">{{ t('adar.routeAssets.stages.reviewDetails.remainingAmount') }}</div>
            <div class="field__value">
              <s-button
                type="primary"
                class="s-typography-button--mini add-button"
                @click.stop="onAddFundsClick('routing')"
              >
                {{ t('adar.routeAssets.stages.reviewDetails.add') }}
              </s-button>
              {{ formatNumber(remainingAmountRequired) }}
              <token-logo class="token-logo" :token="inputToken" />
            </div>
          </div>
        </template>
        <template v-if="showXorRequiredField">
          <s-divider />
          <div class="field">
            <div class="field__label">XOR fee required</div>
            <div class="field__value">
              <s-button
                type="primary"
                class="s-typography-button--mini add-button"
                @click.stop="onAddFundsClick('fee')"
              >
                {{ t('adar.routeAssets.stages.reviewDetails.add') }}
              </s-button>
              {{ formatNumber(xorFeeRequired) }}
              <token-logo class="token-logo" :token="xor" />
            </div>
          </div>
        </template>
        <s-divider v-if="!noIssues" />
        <div class="buttons-container">
          <s-button type="primary" class="s-typography-button--big" :disabled="!noIssues" @click.stop="onContinueClick">
            {{ t('adar.routeAssets.continue') }}
          </s-button>
          <s-button type="secondary" class="s-typography-button--big" @click.stop="cancelButtonAction">
            {{ t('adar.routeAssets.cancelProcessing') }}
          </s-button>
        </div>
      </div>
    </div>
    <div class="container routing-details-section">
      <div class="route-assets__page-header-title">
        {{ t('adar.routeAssets.stages.reviewDetails.routingDetails.title') }}
      </div>
      <div v-for="(assetData, idx) in recipientsData" :key="idx" class="asset-data-container fields-container">
        <div class="asset-title">
          <div>
            <token-logo class="token-logo" :token="assetData.asset" />
          </div>
          <div>{{ assetData.asset.symbol }}</div>
        </div>
        <div class="field">
          <div class="field__label">{{ t('adar.routeAssets.recipients') }}</div>
          <div class="field__value">{{ assetData.recipientsNumber }}</div>
        </div>
        <s-divider />
        <div class="field">
          <div class="field__label">{{ t('adar.routeAssets.stages.reviewDetails.routingDetails.amount') }}</div>
          <div class="field__value">{{ formatNumberJs(assetData.total) }}</div>
          <div class="field__value usd">{{ formatNumberJs(assetData.usd) }}</div>
        </div>
      </div>
    </div>
    <swap-dialog :visible.sync="showSwapDialog" :presetSwapData="swapData"></swap-dialog>
    <select-input-asset-dialog
      :visible.sync="showSelectInputAssetDialog"
      @onInputAssetSelected="onInputAssetSelected"
    ></select-input-asset-dialog>
  </div>
</template>

<script lang="ts">
import { CodecString, FPNumber, NetworkFeesObject, Operation } from '@sora-substrate/util/build';
import { XOR, VAL } from '@sora-substrate/util/build/assets/consts';
import { AccountAsset, Asset } from '@sora-substrate/util/build/assets/types';
import { components, mixins } from '@soramitsu/soraneo-wallet-web';
import { sumBy } from 'lodash';
import { Component, Mixins } from 'vue-property-decorator';

import { AdarComponents, adarFee, slippageMultiplier } from '@/modules/ADAR/consts';
import { adarLazyComponent } from '@/modules/ADAR/router';
import { action, getter, state } from '@/store/decorators';
import type { PresetSwapData, Recipient, SummaryAssetRecipientsInfo } from '@/store/routeAssets/types';
import { getAssetBalance } from '@/utils';

import WarningMessage from '../WarningMessage.vue';

@Component({
  components: {
    TokenLogo: components.TokenLogo,
    SwapDialog: adarLazyComponent(AdarComponents.RouteAssetsSwapDialog),
    WarningMessage,
    SelectInputAssetDialog: adarLazyComponent(AdarComponents.RouteAssetsSelectInputAssetDialog),
  },
})
export default class ReviewDetails extends Mixins(mixins.TransactionMixin) {
  @getter.routeAssets.inputToken inputToken!: Asset;
  @action.routeAssets.processingNextStage nextStage!: () => void;
  @getter.routeAssets.recipients private recipients!: Array<Recipient>;
  @state.wallet.account.fiatPriceObject private fiatPriceObject!: any;
  @state.wallet.account.accountAssets private accountAssets!: Array<AccountAsset>;
  @action.routeAssets.setInputToken setInputToken!: (asset: Asset) => void;
  @action.routeAssets.cancelProcessing private cancelProcessing!: () => void;
  @action.routeAssets.runAssetsRouting private runAssetsRouting!: any;
  @state.wallet.settings.networkFees private networkFees!: NetworkFeesObject;
  @getter.assets.xor xor!: Nullable<AccountAsset>;
  @getter.routeAssets.recipientsGroupedByToken recipientsGroupedByToken!: (
    asset?: Asset | AccountAsset
  ) => SummaryAssetRecipientsInfo[];

  @getter.routeAssets.overallUSDNumber overallUSDNumber!: string;

  showSwapDialog = false;
  showSelectInputAssetDialog = false;

  onInputAssetSelected(asset) {
    this.setInputToken(asset);
    this.showSelectInputAssetDialog = false;
  }

  get isInputAssetXor() {
    return this.inputToken?.address === XOR.address;
  }

  get noIssues() {
    return this.remainingAmountRequired.toNumber() <= 0;
  }

  get usdToBeRouted() {
    return this.overallUSDNumber;
  }

  get estimatedAmount() {
    const sum = sumBy(this.recipientsData, (item: any) => item.required);
    return new FPNumber(sum);
  }

  get adarFeeMultiplier() {
    return new FPNumber(adarFee);
  }

  get adarFeePercent() {
    return this.adarFeeMultiplier.mul(FPNumber.HUNDRED).toString();
  }

  get priceImpactMultiplier() {
    return new FPNumber(slippageMultiplier);
  }

  get priceImpactPercent() {
    return this.priceImpactMultiplier.mul(FPNumber.HUNDRED).toString();
  }

  get networkFee() {
    return FPNumber.fromCodecValue(this.networkFees[Operation.SwapTransferBatch]).mul(
      new FPNumber(this.recipients.length)
    );
  }

  get adarFee() {
    return this.estimatedAmount.add(this.estimatedPriceImpact).mul(this.adarFeeMultiplier);
  }

  get estimatedPriceImpact() {
    return this.estimatedAmount.mul(this.priceImpactMultiplier);
  }

  get estimatedAmountWithFees() {
    return this.isInputAssetXor
      ? this.estimatedAmount.add(this.adarFee).add(this.estimatedPriceImpact).add(this.networkFee)
      : this.estimatedAmount.add(this.adarFee).add(this.estimatedPriceImpact);
  }

  get totalTokensAvailable() {
    return this.formattedBalance;
  }

  get remainingAmountRequired() {
    return this.estimatedAmountWithFees.sub(this.fpBalance);
  }

  get xorFeeRequired() {
    return this.networkFee.sub(this.xorBalance);
  }

  get showXorRequiredField() {
    return this.networkFee > this.xorBalance && !this.isInputAssetXor;
  }

  get xorBalance() {
    const xor = this.accountAssets.find((item) => item.address === XOR.address);
    return FPNumber.fromCodecValue(getAssetBalance(xor), xor?.decimals);
  }

  get recipientsData() {
    return this.recipientsGroupedByToken();
  }

  action: 'fee' | 'routing' = 'fee';

  get routingSwapData(): PresetSwapData {
    const isInputAssetXor = this.inputToken?.symbol === XOR?.symbol;
    const assetFrom = isInputAssetXor ? VAL : XOR;
    const assetTo = this.inputToken;
    const valueTo = this.remainingAmountRequired.toNumber();
    return {
      assetFrom,
      assetTo,
      valueTo,
    };
  }

  get xorFeeSwapData(): PresetSwapData {
    const assetFrom = VAL;
    const assetTo = XOR;
    const valueTo = this.xorFeeRequired.toNumber();
    return {
      assetFrom,
      assetTo,
      valueTo,
    };
  }

  get swapData(): PresetSwapData {
    return this.action === 'fee' ? this.xorFeeSwapData : this.routingSwapData;
  }

  onAddFundsClick(action: 'fee' | 'routing') {
    this.action = action;
    this.showSwapDialog = true;
  }

  get fpBalance(): FPNumber {
    if (!this.getTokenBalance) return FPNumber.ZERO;

    return FPNumber.fromCodecValue(this.getTokenBalance, this.decimals);
  }

  get decimals(): number {
    return this.inputToken?.decimals ?? FPNumber.DEFAULT_PRECISION;
  }

  get formattedBalance(): string {
    return this.fpBalance.toNumber().toLocaleString('en-US', {
      maximumFractionDigits: 6,
    });
  }

  getAssetUSDPrice(asset: Asset) {
    return FPNumber.fromCodecValue(this.fiatPriceObject[asset.address] ?? 0, asset.decimals);
  }

  get getTokenBalance(): CodecString {
    const asset = this.accountAssets.find((item) => item.address === this.inputToken.address);
    return getAssetBalance(asset);
  }

  formatNumberJs(num) {
    return !num || !Number.isFinite(num)
      ? '-'
      : num.toLocaleString('en-US', {
          maximumFractionDigits: 4,
        });
  }

  formatNumber(num: FPNumber) {
    return !num || !num.isFinity()
      ? '-'
      : num.toNumber().toLocaleString('en-US', {
          maximumFractionDigits: 4,
        });
  }

  // onAddFundsClick() {
  //   this.showSwapDialog = true;
  // }

  cancelButtonAction() {
    this.cancelProcessing();
  }

  onContinueClick() {
    this.runAssetsRouting();
    this.nextStage();
  }
}
</script>

<style lang="scss">
.route-assets-review-details {
  text-align: center;
  font-weight: 300;
  font-feature-settings: 'case' on;
  margin: 0 auto;

  &__button {
    width: 100%;
    padding: inherit 30px;
  }

  .token-logo {
    > span {
      width: 16px;
      height: 16px;
    }
  }
  .review-details-section {
    & > * {
      margin-bottom: $inner-spacing-medium;
    }
  }

  .routing-details-section {
    text-align: left;

    & > * {
      margin-bottom: $inner-spacing-medium;
    }

    .asset-title {
      @include flex-start;
      gap: 8px;
      font-weight: 700;
      font-size: 24px;
      line-height: 20px;
      margin-bottom: $inner-spacing-medium;

      .token-logo {
        > span {
          width: 36px;
          height: 36px;
        }
      }
    }

    .asset-data-container {
      box-shadow: var(--s-shadow-element);
      border-radius: 30px;
      background: var(--s-color-utility-body);
      padding: 16px;
    }
  }
}
</style>

<style scoped lang="scss">
.fields-container {
  .el-divider {
    margin-bottom: $inner-spacing-medium;
    margin-top: $inner-spacing-medium;
  }
}

.usd {
  color: var(--s-color-fiat-value);
  &::before {
    content: '~ $';
    display: inline;
  }
}

.pointer {
  cursor: pointer;
}

.buttons-container {
  button {
    display: block;
    width: 100%;
    margin: 16px 0 0 0;
  }
}
</style>
