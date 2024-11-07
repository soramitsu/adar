<template>
  <div class="route-assets-review-details">
    <div class="container review-details-section">
      <div class="route-assets__page-header-title">{{ t('adar.routeAssets.stages.reviewDetails.title') }}</div>
      <div class="route-assets__page-header-description">
        {{ t('adar.routeAssets.stages.reviewDetails.description') }}
      </div>
      <div class="fields-container">
        <template v-if="!allTxsAreTransfers">
          <div class="field">
            <div class="field__label">{{ t('adar.routeAssets.inputAsset') }}</div>
            <div class="field__value pointer" @click="onSelectInputAssetClick">
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
        </template>
        <div class="field">
          <div class="field__label">{{ t('adar.routeAssets.totalUsdToRoute') }}</div>
          <div class="field__value usd">{{ usdToBeRouted }}</div>
        </div>
        <s-divider />
        <div class="transfer-assets-section">
          <p v-if="isExternalTransaction" class="external-tx-label">EXTERNAL</p>
          <p class="transfer-assets-section__title">
            <s-icon v-if="transferBalanceErrors || amountBalanceError" class="icon-status" name="basic-clear-X-xs-24" />
            {{ t('adar.routeAssets.stages.reviewDetails.useTransferTitle') }}
          </p>
          <s-collapse>
            <s-collapse-item v-for="(tokenData, idx) in assetsList" :key="idx">
              <template #title>
                <div class="amount-info__asset-symbol">
                  <token-logo :token="tokenData.asset" size="big" />
                  <div class="amount-info__asset-info">
                    <div class="amount-info__asset-info-line amount-info__asset-info-line_upper">
                      <div class="amount-info__asset-label">{{ tokenData.asset.symbol }}</div>
                      <div class="amount-info__tx-type">
                        {{ tokenData.transfer ? t('operations.Transfer') : t('operations.Swap') }}
                      </div>
                    </div>
                    <div class="amount-info__asset-info-line">
                      <span>{{ `${tokenData.totalAmount.toLocaleString()} ${tokenData.asset.symbol}  ` }}</span>
                      <span class="usd">{{ tokenData.usd.toLocaleString(2) }}</span>
                    </div>
                  </div>
                </div>
              </template>
              <div>
                <info-line
                  :asset-symbol="tokenData.asset.symbol"
                  :label="t('adar.routeAssets.stages.reviewDetails.swapless.adarFee')"
                  :value="tokenData.adarFee.toLocaleString()"
                  class="transfer-assets-section__asset-data"
                  is-formatted
                >
                </info-line>
                <info-line
                  :asset-symbol="tokenData.asset.symbol"
                  :label="getAmountLabel(tokenData.transfer)"
                  :value="tokenData.amount.toLocaleString()"
                  class="transfer-assets-section__asset-data"
                  is-formatted
                >
                </info-line>
                <info-line
                  :asset-symbol="tokenData.asset.symbol"
                  :label="t('adar.routeAssets.stages.reviewDetails.swapless.balance')"
                  :value="tokenData.userBalance.toLocaleString()"
                  class="transfer-assets-section__asset-data"
                  is-formatted
                >
                </info-line>
                <div
                  v-if="!isTransferAssetBalanceOk(tokenData)"
                  class="transfer-assets-section__required-amount required-amount"
                >
                  <div>
                    <div>{{ t('adar.routeAssets.stages.reviewDetails.swapless.required') }}</div>
                    <div class="required-amount__amount">{{ tokenData.amountRequired.toLocaleString() }}</div>
                  </div>
                  <s-button
                    type="primary"
                    class="s-typography-button--mini add-button"
                    @click.stop="onTransferAddFundsClick(tokenData)"
                  >
                    {{ t('adar.routeAssets.stages.reviewDetails.add') }}
                  </s-button>
                </div>
              </div>
            </s-collapse-item>
          </s-collapse>
        </div>
        <slippage-tolerance
          :slippages="slippages"
          :slippageTolerance="currentSlippage"
          @onSlippageChanged="updatePriceImpact"
        />
        <template v-if="xorFeeBalanceError">
          <div class="field">
            <div class="field__label">{{ t('adar.routeAssets.stages.reviewDetails.feeRequired') }}</div>
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
          <s-divider />
        </template>
        <div class="fields-container">
          <info-line
            v-if="isLoggedIn"
            :label="t('networkFeeText')"
            :label-tooltip="t('networkFeeTooltipText')"
            :value="formatNumber(networkFee)"
            :asset-symbol="xorSymbol"
            :fiat-value="getFiatAmountByFPNumber(networkFee)"
            is-formatted
          />
          <info-line
            :label="t('swap.liquidityProviderFee')"
            :label-tooltip="t('swap.liquidityProviderFeeTooltip')"
            :value="formatNumber(maxInputAmount.totalLiquidityProviderFee)"
            :asset-symbol="xorSymbol"
            is-formatted
          />
        </div>
        <div class="buttons-container">
          <s-button type="primary" class="s-typography-button--big" :disabled="!noIssues" @click.stop="onContinueClick">
            {{ continueButtonTitle }}
          </s-button>
          <s-button type="secondary" class="s-typography-button--big" @click.stop="cancelButtonAction">
            {{ t('adar.routeAssets.cancelProcessing') }}
          </s-button>
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
import { AccountAsset, Asset, RegisteredAccountAsset } from '@sora-substrate/util/build/assets/types';
import { components, mixins, WALLET_TYPES } from '@soramitsu/soraneo-wallet-web';
import { Component, Mixins, Watch } from 'vue-property-decorator';

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
export default class ReviewDetails extends Mixins(mixins.TransactionMixin, mixins.FormattedAmountMixin) {
  @getter.routeAssets.inputToken inputToken!: RegisteredAccountAsset;
  @action.routeAssets.processingNextStage nextStage!: () => void;
  @getter.routeAssets.recipients private recipients!: Array<Recipient>;
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

  @getter.routeAssets.transferTxsAmountInfo transferTxsAmountInfo!: Array<OutcomeAssetsAmount>;
  @getter.routeAssets.swapTxsAmountInfo swapTxsAmountInfo!: Array<OutcomeAssetsAmount>;

  @getter.routeAssets.overallUSDNumber overallUSDNumber!: string;
  @getter.routeAssets.slippageTolerance slippageMultiplier!: string;
  @getter.routeAssets.maxInputAmount maxInputAmount!: MaxInputAmountInfo;
  @getter.routeAssets.outcomeAssetsAmountsList outcomeAssetsAmountsList!: Array<OutcomeAssetsAmount>;
  @getter.wallet.account.isLoggedIn isLoggedIn!: boolean;
  @getter.routeAssets.unavailableLiquidityAssetAddresses unavailableLiquidityAssetAddresses!: Array<string>;
  @getter.routeAssets.isLiquidityUnavailable isLiquidityUnavailable!: boolean;
  @getter.wallet.account.assetsDataTable private assetsDataTable!: WALLET_TYPES.AssetsTable;
  @getter.routeAssets.adarSwapEnabled adarSwapEnabled!: boolean;
  @getter.routeAssets.transferTokenBalance transferTokenBalance!: (address: string | undefined) => FPNumber;
  @getter.routeAssets.isExternalTransaction isExternalTransaction!: boolean;

  showSwapDialog = false;
  showSelectInputAssetDialog = false;

  xorSymbol = XOR.symbol;

  onInputAssetSelected(asset) {
    this.setInputToken(asset);
    this.showSelectInputAssetDialog = false;
  }

  onSelectInputAssetClick() {
    this.showSelectInputAssetDialog = true;
  }

  updatePriceImpact(slippage: string) {
    this.setSlippageTolerance(slippage);
  }

  getAmountLabel(isTransfer: boolean) {
    return `${isTransfer ? this.t('operations.Transfer') : this.t('operations.Swap')} ${this.t(
      'adar.routeAssets.stages.reviewDetails.swapless.amount'
    )}`;
  }

  get continueButtonTitle() {
    if (this.isLiquidityUnavailable) {
      return this.t('swap.insufficientLiquidity');
    }
    if (this.amountBalanceError || this.xorFeeBalanceError || this.transferBalanceErrors) {
      return this.t('insufficientBalanceText');
    }
    return this.t('adar.routeAssets.continue');
  }

  get slippages() {
    return ['1', '2', '3'];
  }

  get allTxsAreTransfers() {
    if (!this.adarSwapEnabled) return true;
    return this.recipients.every((recipient) => recipient.useTransfer);
  }

  get assetsList() {
    const swapTx = {
      asset: this.inputToken,
      adarFee: this.adarFee,
      amount: this.estimatedAmount,
      amountRequired: this.remainingAmountRequired,
      totalAmount: this.estimatedAmountWithFees,
      userBalance: this.fpBalance,
      usd: this.swapTxsAmountInfo.reduce((acc, item) => acc.add(item.usd), FPNumber.ZERO),
      priceImpact: this.estimatedPriceImpact.toLocaleString(4),
      transfer: false,
    };
    const list = this.transferTxsAmountInfo.map((item) => ({ transfer: true, ...item }));
    if (!this.allTxsAreTransfers) list.push(swapTx);
    return list;
  }

  get outcomeAssetsAmountsListFiltered() {
    return [...this.transferTxsAmountInfo.map((item) => ({ transfer: true, ...item }))];
  }

  get currentSlippage() {
    return this.slippageMultiplier;
  }

  get isInputAssetXor() {
    return this.inputToken?.address === XOR.address;
  }

  get noIssues() {
    return (
      !this.amountBalanceError &&
      !this.xorFeeBalanceError &&
      !this.transferBalanceErrors &&
      !this.isLiquidityUnavailable
    );
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

  tokenTransferAmountRequired(asset: Asset, requiredValue: FPNumber) {
    const userAssetBalance = this.transferTokenBalance(asset.address);
    return requiredValue.sub(userAssetBalance);
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
    const valueTo = this.remainingAmountRequired;
    return {
      assetFrom,
      assetTo,
      valueTo,
    };
  }

  get xorFeeSwapData(): PresetSwapData {
    const assetFrom = VAL;
    const assetTo = XOR;
    const valueTo = this.xorFeeRequired;
    return {
      assetFrom,
      assetTo,
      valueTo,
    };
  }

  swapData: Nullable<PresetSwapData> = null;

  get totalAmountRequired() {
    return this.outcomeAssetsAmountsListFiltered
      .reduce((acc, item) => acc.add(item.amountRequired), this.remainingAmountRequired.add(this.xorFeeRequired))
      .toString();
  }

  onAddFundsClick(action: 'fee' | 'routing') {
    this.swapData = action === 'fee' ? this.xorFeeSwapData : this.routingSwapData;
    this.showSwapDialog = true;
  }

  onTransferAddFundsClick(tokenData: OutcomeAssetsAmount) {
    const requiredAmount = tokenData.amountRequired;
    let assetFrom: Asset;
    if (this.inputToken.address !== tokenData.asset.address) {
      assetFrom = this.inputToken;
    } else {
      assetFrom = tokenData.asset.address === XOR.address ? VAL : XOR;
    }
    this.swapData = {
      assetFrom,
      assetTo: tokenData.asset,
      valueTo: requiredAmount,
    };
    this.showSwapDialog = true;
  }

  get unavailableSymbols() {
    return this.unavailableLiquidityAssetAddresses.map((assetAddress) => this.assetsDataTable[assetAddress]?.symbol);
  }

  isTransferAssetBalanceOk(tokenData: OutcomeAssetsAmount) {
    return FPNumber.lte(this.tokenTransferAmountRequired(tokenData.asset, tokenData.totalAmount), FPNumber.ZERO);
  }

  get fpBalance(): FPNumber {
    if (!getAssetBalance(this.inputToken)) return FPNumber.ZERO;

    return FPNumber.fromCodecValue(getAssetBalance(this.inputToken), this.decimals);
  }

  get decimals(): number {
    return this.inputToken?.decimals ?? FPNumber.DEFAULT_PRECISION;
  }

  get formattedBalance(): string {
    return this.fpBalance.dp(6).toLocaleString();
  }

  getTokenBalance(asset): CodecString {
    const accountAsset = this.accountAssets.find((item) => item.address === asset.address);
    return getAssetBalance(accountAsset);
  }

  formatNumber(num: FPNumber) {
    return !num || !num.isFinity() ? '-' : num.dp(4).toLocaleString();
  }

  cancelButtonAction() {
    this.cancelProcessing();
  }

  onContinueClick() {
    this.runAssetsRouting();
    this.nextStage();
  }

  @Watch('totalAmountRequired')
  onTransferTokenRequiredChanged() {
    this.showSwapDialog = false;
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
    position: relative;

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

    &__asset-title {
      width: 100%;
    }

    &__adar-fee-info-line {
      margin-bottom: $inner-spacing-medium;
      .info-line-label {
        font-weight: 600;
      }
    }

    &__required-amount {
      border-radius: 24px;
      padding: 12px;
      @include flex-between;
      text-transform: uppercase;
      background-color: var(--s-color-base-on-accent);
      margin-top: 20px;

      &.required-amount {
        .required-amount__amount {
          font-size: 16px;
          font-weight: 600;
        }
      }
    }

    .el-collapse.neumorphic .el-icon-arrow-right {
      transition: transform 0.3s;

      margin-left: 6px;
      height: 15px;
      line-height: 15px;
      width: 15.8px;
      padding: 0;

      background-color: var(--s-color-base-content-tertiary);
      color: var(--s-color-base-on-accent) !important;
      border-radius: var(--s-border-radius-medium);
      font-size: 16px;
    }

    .el-collapse-item__header {
      height: 64px;
      position: relative;
      margin-bottom: 12px;
    }
  }
}
</style>

<style scoped lang="scss">
.amount-info {
  &__asset-symbol {
    font-weight: 800;
    font-size: 18px;
    @include flex-start;
    gap: 8px;
    margin-right: auto;
  }
  &__info {
    margin: 12px auto;

    &-line {
      @include flex-center;
      justify-content: space-between;
    }
  }

  &__token-selection {
    font-weight: 600;
    font-size: var(--s-font-size-medium);
    @include flex-center;
    justify-content: space-between;
  }

  &__asset-info-line {
    font-style: normal;
    font-weight: 300;
    &_upper {
      font-weight: 600;
      @include flex-start;
      gap: 4px;
    }
  }

  &__asset-info {
    @include flex-center;
    flex-direction: column;
    justify-content: space-between;
    align-items: start;
    line-height: var(--s-line-height-base);
    font-size: 12px;
  }

  &__tx-type {
    text-align: center;
    font-weight: 600;
    text-transform: uppercase;
    background-color: var(--s-color-base-on-accent);
    border-radius: 4px;
    padding: 2px 4px;
  }
  &__asset-label {
    font-size: 18px;
    font-weight: 800;
  }
  margin: 16px auto;
  box-shadow: var(--s-shadow-element);
  border-radius: 30px;
  background: var(--s-color-utility-body);
  padding: 16px;
}
.fields-container {
  margin: $inner-spacing-big 0;

  .field {
    padding: 2px 4px;
  }
}

.usd {
  color: var(--s-color-fiat-value);
  &::before {
    content: '$';
    display: inline;
  }
  &-appr {
    color: var(--s-color-fiat-value);
    &::before {
      content: '~ $';
      display: inline;
    }
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

.external-tx-label {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px 6px;
  color: var(--s-color-base-background);
  background: linear-gradient(135deg, var(--s-color-theme-accent-hover), var(--s-color-theme-accent));
  font-weight: bold;
  font-size: 10px;
  border-radius: 2px 10px 2px 10px;
  box-shadow: 0 4px 8px var(--s-color-base-background-hover);
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: transform 0.2s ease-in-out;
  pointer-events: none;
}
</style>
