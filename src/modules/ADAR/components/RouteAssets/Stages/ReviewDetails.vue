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
              !amountBalanceError
                ? `${t('adar.routeAssets.stages.reviewDetails.okBalance')}`
                : `${t('adar.routeAssets.stages.reviewDetails.badBalance')}`
            "
            :isError="amountBalanceError"
          />
        </div>
        <template v-if="amountBalanceError">
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
        <template v-if="xorFeeBalanceError">
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
        <s-divider />
        <template v-if="outcomeAssetsAmountsListFiltered.length">
          <div class="transfer-assets-section">
            <p class="transfer-assets-section__title">
              <s-icon v-if="transferBalanceErrors" class="icon-status" name="basic-clear-X-xs-24" />
              {{ t('adar.routeAssets.stages.reviewDetails.useTransferTitle') }}
            </p>
            <info-line
              v-for="(tokenData, idx) in outcomeAssetsAmountsListFiltered"
              :key="idx"
              :asset-symbol="tokenData.asset.symbol"
              :label="tokenData.asset.symbol"
              :value="tokenData.totalAmount"
              :fiat-value="tokenData.usd"
              class="transfer-assets-section__asset-data"
              :class="{ 'transfer-assets-section__asset-data_error': !isTransferAssetBalanceOk(tokenData) }"
              is-formatted
            >
              <template v-if="!isTransferAssetBalanceOk(tokenData)">
                <s-button
                  type="primary"
                  class="s-typography-button--mini add-button"
                  @click.stop="onTransferAddFundsClick(tokenData)"
                >
                  {{ t('adar.routeAssets.stages.reviewDetails.add') }}
                </s-button>
              </template>
            </info-line>
          </div>
          <s-divider />
        </template>
        <slippage-tolerance
          :slippages="slippages"
          :slippageTolerance="currentSlippage"
          @onSlippageChanged="updatePriceImpact"
        />
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
    <select-token :visible.sync="showSelectInputAssetDialog" :connected="isLoggedIn" @select="onInputAssetSelected" />
  </div>
</template>

<script lang="ts">
import { CodecString, FPNumber, NetworkFeesObject, Operation } from '@sora-substrate/util/build';
import { XOR, VAL } from '@sora-substrate/util/build/assets/consts';
import { AccountAsset, Asset } from '@sora-substrate/util/build/assets/types';
import { components, mixins } from '@soramitsu/soraneo-wallet-web';
import { Component, Mixins } from 'vue-property-decorator';

import { Components } from '@/consts';
import SlippageTolerance from '@/modules/ADAR/components/App/shared/SlippageTolerance.vue';
import { AdarComponents, adarFee } from '@/modules/ADAR/consts';
import { adarLazyComponent } from '@/modules/ADAR/router';
import { lazyComponent } from '@/router';
import { action, getter, mutation, state } from '@/store/decorators';
import type {
  MaxInputAmountInfo,
  OutcomeAssetsAmount,
  PresetSwapData,
  Recipient,
  SummaryAssetRecipientsInfo,
} from '@/store/routeAssets/types';
import { getAssetBalance } from '@/utils';

import WarningMessage from '../WarningMessage.vue';

@Component({
  components: {
    TokenLogo: components.TokenLogo,
    SwapDialog: adarLazyComponent(AdarComponents.RouteAssetsSwapDialog),
    WarningMessage,
    SelectInputAssetDialog: adarLazyComponent(AdarComponents.RouteAssetsSelectInputAssetDialog),
    SlippageTolerance,
    InfoLine: components.InfoLine,
    SelectToken: lazyComponent(Components.SelectToken),
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
  @mutation.routeAssets.setSlippageTolerance private setSlippageTolerance!: (slippage: string) => void;
  @getter.assets.xor xor!: Nullable<AccountAsset>;
  @getter.routeAssets.recipientsGroupedByToken recipientsGroupedByToken!: (
    asset?: Asset | AccountAsset
  ) => SummaryAssetRecipientsInfo[];

  @getter.routeAssets.overallUSDNumber overallUSDNumber!: string;
  @getter.routeAssets.overallEstimatedTokens overallEstimatedTokens!: (asset?: AccountAsset) => FPNumber;
  @getter.routeAssets.slippageTolerance slippageMultiplier!: string;
  @getter.routeAssets.maxInputAmount maxInputAmount!: MaxInputAmountInfo;
  @getter.routeAssets.outcomeAssetsAmountsList outcomeAssetsAmountsList!: Array<OutcomeAssetsAmount>;
  @getter.wallet.account.isLoggedIn isLoggedIn!: boolean;

  showSwapDialog = false;
  showSelectInputAssetDialog = false;

  onInputAssetSelected(asset) {
    this.setInputToken(asset);
    this.showSelectInputAssetDialog = false;
  }

  updatePriceImpact(slippage: string) {
    this.setSlippageTolerance(slippage);
  }

  get slippages() {
    return ['1', '2', '3'];
  }

  get outcomeAssetsAmountsListFiltered() {
    return this.outcomeAssetsAmountsList.filter((item) => item.asset.address !== this.inputToken.address);
  }

  get currentSlippage() {
    return this.slippageMultiplier;
  }

  get isInputAssetXor() {
    return this.inputToken?.address === XOR.address;
  }

  get noIssues() {
    return !this.amountBalanceError && !this.xorFeeBalanceError && !this.transferBalanceErrors;
  }

  get amountBalanceError() {
    return FPNumber.isGreaterThan(this.remainingAmountRequired, FPNumber.ZERO);
  }

  get xorFeeBalanceError() {
    return FPNumber.isGreaterThan(this.networkFee, this.xorBalance) && !this.isInputAssetXor;
  }

  get transferBalanceErrors() {
    return this.outcomeAssetsAmountsListFiltered.some((item) => {
      const { asset, totalAmount } = item;
      return FPNumber.gt(this.tokenTransferAmountRequired(asset, totalAmount), FPNumber.ZERO);
    });
  }

  tokenTransferAmountRequired(asset: Asset, requiredValue: string) {
    const userAssetBalanceString = this.getTokenBalance(asset);
    const userAssetBalance = FPNumber.fromCodecValue(userAssetBalanceString, asset.decimals);
    return new FPNumber(requiredValue).sub(userAssetBalance);
  }

  get usdToBeRouted() {
    return this.overallUSDNumber;
  }

  get estimatedAmount() {
    return this.maxInputAmount.totalAmount;
  }

  get adarFeeMultiplier() {
    return new FPNumber(adarFee).div(FPNumber.HUNDRED);
  }

  get adarFeePercent() {
    return this.adarFeeMultiplier.mul(FPNumber.HUNDRED).toLocaleString();
  }

  get priceImpactMultiplier() {
    return new FPNumber(this.slippageMultiplier).div(FPNumber.HUNDRED);
  }

  get priceImpactPercent() {
    return new FPNumber(this.slippageMultiplier).toLocaleString();
  }

  get networkFee() {
    return FPNumber.fromCodecValue(this.networkFees[Operation.SwapTransferBatch]).mul(
      new FPNumber(this.recipients.length)
    );
  }

  get adarFee() {
    return this.estimatedAmount.mul(this.adarFeeMultiplier);
  }

  get estimatedPriceImpact() {
    return this.estimatedAmount.mul(this.priceImpactMultiplier);
  }

  get estimatedAmountWithFees() {
    return this.isInputAssetXor
      ? this.maxInputAmount.totalAmountWithFee.add(this.networkFee)
      : this.maxInputAmount.totalAmountWithFee;
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

  get xorBalance() {
    return FPNumber.fromCodecValue(this.getTokenBalance(XOR), XOR?.decimals);
  }

  get recipientsData() {
    return this.recipientsGroupedByToken();
  }

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

  swapData: Nullable<PresetSwapData> = null;

  onAddFundsClick(action: 'fee' | 'routing') {
    this.swapData = action === 'fee' ? this.xorFeeSwapData : this.routingSwapData;
    this.showSwapDialog = true;
  }

  onTransferAddFundsClick(tokenData: OutcomeAssetsAmount) {
    const requiredAmount = this.tokenTransferAmountRequired(tokenData.asset, tokenData.totalAmount);
    this.swapData = {
      assetFrom: this.inputToken,
      assetTo: tokenData.asset,
      valueTo: requiredAmount.toNumber(),
    };
    this.showSwapDialog = true;
  }

  isTransferAssetBalanceOk(tokenData) {
    return FPNumber.lt(this.tokenTransferAmountRequired(tokenData.asset, tokenData.totalAmount), FPNumber.ZERO);
  }

  get fpBalance(): FPNumber {
    if (!this.getTokenBalance(this.inputToken)) return FPNumber.ZERO;

    return FPNumber.fromCodecValue(this.getTokenBalance(this.inputToken), this.decimals);
  }

  get decimals(): number {
    return this.inputToken?.decimals ?? FPNumber.DEFAULT_PRECISION;
  }

  get formattedBalance(): string {
    return this.fpBalance.dp(6).toLocaleString();
  }

  getAssetUSDPrice(asset: Asset) {
    return FPNumber.fromCodecValue(this.fiatPriceObject[asset.address] ?? 0, asset.decimals);
  }

  getTokenBalance(asset): CodecString {
    const accountAsset = this.accountAssets.find((item) => item.address === asset.address);
    return getAssetBalance(accountAsset);
  }

  formatNumberJs(num) {
    return new FPNumber(num).dp(4).toLocaleString();
  }

  formatNumber(num: FPNumber) {
    return !num || !num.isFinity() ? '-' : num.dp(4).toLocaleString();
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

  .transfer-assets-section {
    box-shadow: var(--s-shadow-element);
    border-radius: 10px;
    background: var(--s-color-utility-body);
    padding: 16px;

    &__title {
      font-weight: 500;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    &__asset-data {
      &.info-line {
        padding-left: 12px;
      }
      &_error {
        background: rgba(254, 83, 96, 0.15);
        border-radius: 4px;
      }

      button.el-button.neumorphic.s-primary.add-button {
        box-shadow: none;
      }
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

i.icon-status {
  font-size: 16px !important;
  color: var(--s-color-status-error);
}
</style>
