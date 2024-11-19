<template>
  <div v-loading="isSpinner || !fileName" class="container route-assets-processing-template">
    <div class="route-assets__page-header-title">{{ t('adar.routeAssets.stages.processTemplate.title') }}</div>
    <div class="route-assets__page-header-description">
      {{ t('adar.routeAssets.stages.processTemplate.description') }}
    </div>
    <div v-if="!isSpinner && fileName" class="content-container">
      <div class="route-assets-processing-template__file-info">
        <div>
          <svg class="file-icon" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M7 2C4.79086 2 3 3.79086 3 6V18C3 20.2091 4.79086 22 7 22H17C19.2091 22 21 20.2091 21 18V7.65685C21 6.59599 20.5786 5.57857 19.8284 4.82843L18.1716 3.17157C17.4214 2.42143 16.404 2 15.3431 2H7ZM8 6.25C7.58579 6.25 7.25 6.58579 7.25 7C7.25 7.41421 7.58579 7.75 8 7.75H16C16.4142 7.75 16.75 7.41421 16.75 7C16.75 6.58579 16.4142 6.25 16 6.25H8ZM7.25 12C7.25 11.5858 7.58579 11.25 8 11.25H16C16.4142 11.25 16.75 11.5858 16.75 12C16.75 12.4142 16.4142 12.75 16 12.75H8C7.58579 12.75 7.25 12.4142 7.25 12ZM8 16.25C7.58579 16.25 7.25 16.5858 7.25 17C7.25 17.4142 7.58579 17.75 8 17.75H12C12.4142 17.75 12.75 17.4142 12.75 17C12.75 16.5858 12.4142 16.25 12 16.25H8Z"
            />
          </svg>
        </div>
        <div>
          <div>{{ fileName }}</div>
          <div class="metadata">{{ `${lastModified} &#183; ${fileSize} kb` }}</div>
        </div>
      </div>
      <div class="route-assets-processing-template__amount-info-container">
        <div v-if="transferTxsAmountInfo.length">
          <div class="tx-type-title">
            <div class="tx-type-label">{{ t('operations.Transfer') }}</div>
            <s-tooltip :content="t('adar.routeAssets.stages.processTemplate.swapNotNecessary')" border-radius="mini">
              <s-icon name="info-16" size="16px" />
            </s-tooltip>
          </div>

          <div v-for="(amountInfo, idx) in transferTxsAmountInfo" :key="idx" class="amount-info">
            <div class="amount-info__asset-symbol">
              <token-logo class="token-logo" :token="amountInfo.asset" size="big" />
              <div>
                <div>{{ amountInfo.asset.symbol }}</div>
                <token-address v-bind="amountInfo.asset" class="input-value" />
              </div>
            </div>
            <div class="amount-info__info">
              <info-line
                :label="t('adar.routeAssets.recipients')"
                :value="`${amountInfo.recipientsNumber ?? 0}`"
                is-formatted
              />
              <info-line
                :label="`${t('adar.routeAssets.stages.routing.amountText.default')} ${amountInfo.asset.symbol}`"
                :value="amountInfo.totalAmount.toLocaleString(5, true)"
                :fiat-value="amountInfo.usd.toLocaleString(2)"
                is-formatted
              />
              <info-line
                :label="`${t('adar.routeAssets.stages.reviewDetails.swapless.balance')} ${amountInfo.asset.symbol}`"
                :value="amountInfo.userBalance.toLocaleString(5, true)"
                :fiat-value="getFiatAmountByFPNumber(amountInfo.userBalance, amountInfo.asset)"
                is-formatted
              />
            </div>
          </div>
        </div>
        <div v-if="!hideSwapSection">
          <div class="tx-type-title">
            <div class="tx-type-label">{{ t('operations.Swap') }}</div>
            <s-tooltip :content="t('adar.routeAssets.stages.processTemplate.swapNecessary')" border-radius="mini">
              <s-icon name="info-16" size="16px" />
            </s-tooltip>
          </div>
          <div class="amount-info">
            <div class="amount-info__token-selection">
              <div>{{ t('adar.routeAssets.dialogs.selectInputAssetDialog.title') }}</div>
              <div
                class="amount-info__asset-symbol pointer"
                @click="
                  () => {
                    showSelectInputAssetDialog = true;
                  }
                "
              >
                <token-logo class="token-logo" :token="inputToken" size="big" />
                <div>{{ inputToken.symbol }}</div>
                <div>
                  <s-icon name="arrows-chevron-down-rounded-24" size="20" />
                </div>
              </div>
            </div>

            <div class="amount-info__info">
              <info-line
                :label="t('adar.routeAssets.recipients')"
                :value="`${swapDataInfo.recipientsNumber ?? 0}`"
                is-formatted
              />
              <info-line
                :label="`${t('adar.routeAssets.stages.routing.amountText.default')} ${inputToken.symbol}`"
                :value="maxInputAmount.totalAmount.toLocaleString(5, true)"
                :fiat-value="swapDataInfo.usd.toLocaleString(2)"
                is-formatted
              />
              <info-line
                :asset-symbol="inputToken.symbol"
                :label="t('adar.routeAssets.stages.reviewDetails.swapless.balance')"
                :value="fpBalance.toLocaleString(5, true)"
                is-formatted
              />
            </div>
          </div>
        </div>
      </div>
      <div class="buttons-container">
        <s-button
          v-if="!isLoggedIn"
          class="s-typography-button--big"
          data-test-name="connectPolkadot"
          type="primary"
          @click="connectWallet(false)"
        >
          {{ t('connectWalletText') }}
        </s-button>
        <s-button
          v-else-if="!externalAccount && isExternalTransaction"
          class="el-button--connect s-typography-button--big"
          data-test-name="useMetamaskProvider"
          type="primary"
          @click="connectWallet(true)"
        >
          {{ t('connectWalletText') }}
        </s-button>
        <s-button
          v-else
          type="primary"
          class="s-typography-button--big"
          :disabled="nextButtonDisabled"
          @click.stop="nextButtonAction"
        >
          {{ nextButtonTitle }}
        </s-button>
        <s-button type="secondary" class="s-typography-button--big" @click.stop="cancelButtonAction">
          {{ t('adar.routeAssets.cancelProcessing') }}
        </s-button>
      </div>
    </div>
    <fix-issues-dialog
      :visible.sync="fixIssuesDialog"
      :recipient="incorrectRecipients[currentIssueIdx]"
      :currentIssueIdx="currentIssueIdx"
      :totalIssuesCount="incorrectRecipients.length"
      @changeIssueIdx="changeIssueIdx"
    ></fix-issues-dialog>
    <select-token :visible.sync="showSelectInputAssetDialog" :connected="isLoggedIn" @select="onInputAssetSelected" />
    <select-provider-dialog />
  </div>
</template>

<script lang="ts">
import { FPNumber } from '@sora-substrate/util/build';
import { Asset, RegisteredAccountAsset } from '@sora-substrate/util/build/assets/types';
import { components, mixins } from '@soramitsu/soraneo-wallet-web';
import { Component, Mixins, Watch } from 'vue-property-decorator';

import TranslationMixin from '@/components/mixins/TranslationMixin';
import { Components } from '@/consts';
import { AdarComponents } from '@/modules/ADAR/consts';
import { adarLazyComponent } from '@/modules/ADAR/router';
import { lazyComponent } from '@/router';
import { action, getter, mutation } from '@/store/decorators';
import { MaxInputAmountInfo, OutcomeAssetsAmount, Recipient } from '@/store/routeAssets/types';
import validate from '@/store/routeAssets/utils';
import { getAssetBalance } from '@/utils';
@Component({
  components: {
    FixIssuesDialog: adarLazyComponent(AdarComponents.RouteAssetsFixIssuesDialog),
    TokenLogo: components.TokenLogo,
    InfoLine: components.InfoLine,
    SelectToken: lazyComponent(Components.SelectToken),
    TokenAddress: components.TokenAddress,
    SelectProviderDialog: lazyComponent(Components.SelectProviderDialog),
  },
})
export default class ProcessTemplate extends Mixins(TranslationMixin, mixins.FormattedAmountMixin) {
  @getter.routeAssets.file private file!: Nullable<File>;
  @getter.routeAssets.recipients private recipients!: Array<Recipient>;
  @getter.routeAssets.transferTxsAmountInfo transferTxsAmountInfo!: Array<OutcomeAssetsAmount>;
  @getter.routeAssets.maxInputAmount maxInputAmount!: MaxInputAmountInfo;
  @action.routeAssets.processingNextStage nextStage!: () => void;
  @action.routeAssets.processingPreviousStage previousStage!: () => void;
  @action.routeAssets.cancelProcessing private cancelProcessing!: () => void;
  @action.routeAssets.setInputToken setInputToken!: (asset: Asset) => void;
  @action.routeAssets.bridgeTransactionsInit bridgeTransactionsInit!: () => Promise<void>;
  @getter.wallet.account.isLoggedIn isLoggedIn!: boolean;
  @getter.routeAssets.inputToken inputToken!: RegisteredAccountAsset;
  @getter.routeAssets.adarSwapEnabled adarSwapEnabled!: boolean;
  @mutation.web3.setSoraAccountDialogVisibility public setSoraAccountDialogVisibility!: (flag: boolean) => void;
  @mutation.web3.setSelectProviderDialogVisibility setSelectProviderDialogVisibility!: (flag: boolean) => void;
  @getter.bridge.recipient externalAccount!: string;
  @getter.routeAssets.isExternalTransaction isExternalTransaction!: boolean;

  fixIssuesDialog = false;
  isSpinner = true;
  currentIssueIdx = 0;

  showSelectInputAssetDialog = false;

  onInputAssetSelected(asset) {
    this.setInputToken(asset);
    this.showSelectInputAssetDialog = false;
  }

  created() {
    setTimeout(() => {
      this.isSpinner = false;
    }, 1000);
  }

  get nextButtonDisabled() {
    return !this.recipientsCount;
  }

  get fileName() {
    return this.file?.name;
  }

  get lastModified() {
    return this.formatDate(this.file?.lastModified || 0, 'D MMM');
  }

  get fileSize() {
    return new FPNumber(this.file?.size || 1).div(new FPNumber(1024)).dp(2).toLocaleString();
  }

  get recipientsCount() {
    return this.recipients?.length;
  }

  get incorrectRecipients() {
    return this.recipients
      .filter((recipient) => !this.validateRecipient(recipient))
      .map((item) => ({ ...item, amount: item.amount?.toString(), usd: item.usd.toString() }));
  }

  get incorrectRecipientsLength() {
    return this.incorrectRecipients.length;
  }

  get nextButtonTitle() {
    return this.incorrectRecipients.length > 0
      ? `${this.t('adar.routeAssets.stages.processTemplate.fixButton')}`
      : `${this.t('adar.routeAssets.continue')}`;
  }

  get swapDataInfo() {
    return this.recipients.reduce(
      (acc, recipient) => {
        if (recipient.useTransfer || recipient.asset.address === this.inputToken.address) return acc;
        return {
          recipientsNumber: ++acc.recipientsNumber,
          amount: acc.amount.add(recipient.amount ?? FPNumber.ZERO),
          usd: acc.usd.add(recipient.usd ?? FPNumber.ZERO),
        };
      },
      {
        recipientsNumber: 0,
        amount: FPNumber.ZERO,
        usd: FPNumber.ZERO,
      }
    );
  }

  get hideSwapSection() {
    if (!this.adarSwapEnabled) return true;
    return this.recipients.every((recipient) => recipient.useTransfer);
  }

  get fpBalance(): FPNumber {
    const balance = getAssetBalance(this.inputToken);
    if (!balance) return FPNumber.ZERO;

    return FPNumber.fromCodecValue(balance, this.inputToken.decimals);
  }

  async nextButtonAction() {
    if (this.incorrectRecipients.length > 0) this.fixIssuesDialog = true;
    else {
      if (this.isExternalTransaction) await this.bridgeTransactionsInit();
      this.nextStage();
    }
  }

  cancelButtonAction() {
    this.cancelProcessing();
  }

  validateRecipient(recipient: Recipient) {
    return validate.validate(recipient);
  }

  changeIssueIdx(newValue) {
    this.currentIssueIdx = newValue;
  }

  connectWallet(isExternalWallet: boolean): void {
    if (isExternalWallet) this.setSelectProviderDialogVisibility(true);
    else this.setSoraAccountDialogVisibility(true);
  }

  @Watch('incorrectRecipientsLength', { deep: true })
  onIssueFixedChanged(newVal) {
    if (newVal < 1) {
      this.fixIssuesDialog = false;
      return;
    }
    if (this.currentIssueIdx <= newVal) {
      this.currentIssueIdx = newVal - 1;
    }
  }
}
</script>

<style lang="scss">
.route-assets-processing-template {
  text-align: center;
  font-weight: 300;
  font-feature-settings: 'case' on;

  &__title {
    font-size: 24px;
  }

  &__description {
    font-size: 16px;
  }

  > *:not(:last-child) {
    margin-bottom: $inner-spacing-big;
  }

  &__button {
    width: 100%;
    padding: inherit 30px;
  }

  &__label {
    font-weight: 300;
    font-size: 13px;
    line-height: 140%;
    color: var(--s-color-brand-day);
  }

  &__file-info {
    background: var(--s-color-utility-body);
    box-shadow: var(--s-shadow-element);
    border-radius: 24px;
    padding: 11px 16px;
    @include flex-start;
    gap: 16px;
    text-align: left;
    margin-bottom: $inner-spacing-big;

    .metadata {
      font-weight: 300;
      font-size: 12px;
      line-height: 150%;
      text-align: left;
      color: var(--s-color-base-content-secondary);
    }
  }

  &__amount-info-container {
    text-align: left;

    > div {
      margin: 24px auto;
    }

    .amount-info {
      &__asset-symbol {
        font-weight: 800;
        font-size: 18px;
        @include flex-start;
        gap: 8px;
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
      margin: 16px auto;
      box-shadow: var(--s-shadow-element);
      border-radius: 30px;
      background: var(--s-color-utility-body);
      padding: 16px;
    }
  }
}
</style>

<style scoped lang="scss">
.buttons-container {
  button {
    display: block;
    width: 100%;
    margin: 16px 0 0 0;
  }
}

.file-icon {
  fill: #d5cdd0;
}

.content-container {
  margin-bottom: 0;
}

.pointer {
  cursor: pointer;
}

.tx-type-label {
  font-weight: 600;
  font-size: var(--s-font-size-big);
  text-align: center;
  text-transform: uppercase;
}

.tx-type-title {
  @include flex-center;
  gap: 4px;
}
</style>
