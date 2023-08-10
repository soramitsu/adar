<template>
  <div class="select-input-asset-dialog">
    <dialog-base
      :visible.sync="isVisible"
      :title="`${t('adar.routeAssets.dialogs.selectInputAssetDialog.title')}`"
      custom-class="dialog__select-input-asset"
    >
      <div class="fields-container">
        <div class="field">
          <div class="field__label">{{ t('adar.routeAssets.dialogs.selectInputAssetDialog.totalUsd') }}</div>
          <div class="field__value usd">{{ overallUSDNumber }}</div>
        </div>
        <s-divider />
        <div v-for="(asset, idx) in tokensEstimate" :key="idx">
          <div class="field">
            <div class="field__label">
              {{
                t('adar.routeAssets.dialogs.selectInputAssetDialog.estimatedToken', { assetName: asset.asset.symbol })
              }}
            </div>
            <div class="field__value pointer">
              <div>{{ asset.estimateAmount }}</div>
              <div>
                <token-logo class="token-logo" :token="asset.asset" />
              </div>
            </div>
          </div>
          <s-divider />
        </div>
      </div>
      <div>{{ t('adar.routeAssets.dialogs.selectInputAssetDialog.description') }}</div>
      <div>
        <AssetListItem
          v-for="(asset, idx) in assetList"
          :key="idx"
          :asset="asset"
          with-fiat
          with-clickable-logo
          @click="onSelected(asset)"
        >
          <template>
            <formatted-amount-with-fiat-value
              value-class="asset-value"
              :value="getBalance(asset)"
              :font-size-rate="FontSizeRate.SMALL"
              :fiat-value="getFiatBalance(asset)"
              :fiat-font-size-rate="FontSizeRate.SMALL"
              :fiat-font-weight-rate="FontWeightRate.SMALL"
              :with-left-shift="true"
            >
            </formatted-amount-with-fiat-value>
          </template>
          <template>
            <s-button
              class="wallet-assets__button el-button--details"
              type="action"
              size="small"
              alternative
              :tooltip="'Select'"
            >
              <s-icon name="arrows-chevron-right-rounded-24" size="28" />
            </s-button>
          </template>
        </AssetListItem>
      </div>
    </dialog-base>
  </div>
</template>

<script lang="ts">
import { FPNumber } from '@sora-substrate/util/build';
import { AccountAsset, Asset } from '@sora-substrate/util/build/assets/types';
import { mixins, components } from '@soramitsu/soraneo-wallet-web';
import { Component, Mixins } from 'vue-property-decorator';

import { inputTokenVariants } from '@/modules/ADAR/consts';
import { getter, state } from '@/store/decorators';
import { SummaryAssetRecipientsInfo } from '@/store/routeAssets/types';
@Component({
  components: {
    DialogBase: components.DialogBase,
    TokenAddress: components.TokenAddress,
    TokenLogo: components.TokenLogo,
    AssetListItem: components.AssetListItem,
    FormattedAmountWithFiatValue: components.FormattedAmountWithFiatValue,
  },
})
export default class SelectInputAssetDialog extends Mixins(
  mixins.TransactionMixin,
  mixins.DialogMixin,
  mixins.FormattedAmountMixin
) {
  @state.wallet.account.accountAssets private accountAssets!: Array<AccountAsset>;
  @getter.routeAssets.overallUSDNumber overallUSDNumber!: string;
  @getter.routeAssets.recipientsGroupedByToken recipientsGroupedByToken!: (
    asset?: Asset | AccountAsset
  ) => SummaryAssetRecipientsInfo[];

  @getter.routeAssets.overallEstimatedTokens overallEstimatedTokens!: (asset?: AccountAsset) => FPNumber;

  get assetList(): Array<AccountAsset> {
    return this.accountAssets.filter((item) => inputTokenVariants.includes(item.symbol.toLowerCase()));
  }

  get tokensEstimate() {
    return inputTokenVariants.map((symbol) => {
      const asset = this.assetList.find((item) => item.symbol.toLowerCase() === symbol) as AccountAsset;
      const estimateAmount = this.overallEstimatedTokens(asset)?.toLocaleString();
      return {
        asset,
        estimateAmount,
      };
    });
  }

  isZeroBalance(asset: AccountAsset): boolean {
    return this.isCodecZero(asset.balance.transferable, asset.decimals);
  }

  getBalance(asset: AccountAsset): string {
    return `${this.formatCodecNumber(asset.balance.transferable, asset.decimals)}`;
  }

  onSelected(asset) {
    this.$emit('onInputAssetSelected', asset);
  }
}
</script>

<style lang="scss">
.dialog__select-input-asset {
  .el-dialog {
    max-width: 468px;
    &__body {
      > div > div {
        margin-bottom: $inner-spacing-medium;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.browse-button {
  width: 100%;
  margin-bottom: 16px;
  margin-top: 24px;
}

.usd {
  color: var(--s-color-fiat-value);
  &::before {
    content: '~ $';
    display: inline;
  }
}
</style>
