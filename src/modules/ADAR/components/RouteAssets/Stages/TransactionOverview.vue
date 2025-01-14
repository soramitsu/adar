<template>
  <div v-loading="!tableData" class="container routing-template-transactions">
    <div class="routing-template-transactions__header">
      <!-- <div> -->
      <generic-page-header
        :title="`${t('adar.routeAssets.stages.transactionOverview.title')} (${recipients.length})`"
        class="page-header__title"
      >
      </generic-page-header>
      <search-input
        v-model="query"
        :placeholder="`${t('searchText')}...`"
        autofocus
        @clear="handleResetSearch"
        class="routing-template-transactions__search"
      />
      <!-- </div> -->
    </div>
    <div>
      <s-table :data="tableData" :highlight-current-row="false" size="big" class="transactions-table">
        <!-- INDEX -->
        <s-table-column width="40">
          <template #header>
            <span>{{ '#' }}</span>
          </template>
          <template v-slot="{ row }">
            <div>
              <span>{{ row.num }}</span>
            </div>
          </template>
        </s-table-column>
        <!-- LABEL -->
        <s-table-column width="60">
          <template #header>
            <span>⬥</span>
          </template>
          <template v-slot="{ row }">
            <div class="name-label">
              <div>{{ getInitials(row) }}</div>
            </div>
          </template>
        </s-table-column>

        <!-- NAME -->
        <s-table-column prop="name" sortable>
          <template #header>
            <span>{{ t('adar.routeAssets.name') }}</span>
          </template>
        </s-table-column>

        <!-- WALLET -->
        <s-table-column prop="wallet" width="130">
          <template #header>
            <span>{{ t('adar.routeAssets.wallet') }}</span>
          </template>
          <template v-slot="{ row }">
            <s-dropdown
              type="button"
              buttonType="link"
              placement="bottom-start"
              class="wallet-address"
              @select="handleCopyAddress(row.wallet)"
            >
              <div>{{ formatAddress(row.wallet) }}</div>
              <template slot="menu">
                <s-dropdown-item>
                  <div class="wallet-tooltip">
                    <div>{{ row.wallet }}</div>
                    <div><s-icon class="icon-divider" name="copy-16" /></div>
                  </div>
                </s-dropdown-item>
              </template>
            </s-dropdown>
          </template>
        </s-table-column>

        <!-- USD -->
        <s-table-column prop="usd" class="usd-column" sortable>
          <template #header>
            <span>{{ t('adar.routeAssets.usd') }}</span>
          </template>
          <template v-slot="{ row }">
            <div>
              <span class="usd-column__data">{{ formatNumber(row.usd, 2) }}</span>
            </div>
          </template>
        </s-table-column>

        <!-- IN TOKENS -->
        <s-table-column>
          <template #header>
            <span>{{ t('adar.routeAssets.stages.transactionOverview.amount') }}</span>
          </template>
          <template v-slot="{ row }">
            <div class="in-tokens">
              <div>{{ getAmount(row) }}</div>
              <div class="in-tokens__asset">
                <div><token-logo class="token-logo" :token="row.asset" /></div>
                <div>{{ row.asset.symbol }}</div>
              </div>
            </div>
          </template>
        </s-table-column>

        <!-- STATUS -->
        <s-table-column prop="status" class="status-property" width="158">
          <template #header>
            <span>{{ t('adar.routeAssets.status') }}</span>
          </template>
          <template v-slot="{ row }">
            <div class="status-property__data">
              <div :class="`status-property__label status-property__label_${getStatusClass(row)}`">
                {{ getStatus(row) || 'valid' }}
              </div>
            </div>
          </template>
        </s-table-column>

        <!-- NOSWAP -->
        <s-table-column>
          <template #header>
            <span>{{ t('operations.Transfer') }}</span>
          </template>
          <template v-slot="{ row }">
            <div>
              <p class="tx-type">{{ row.useTransfer ? t('operations.Transfer') : t('operations.Swap') }}</p>
            </div>
          </template>
        </s-table-column>
      </s-table>
      <s-pagination
        class="transactions-table-pagination"
        :layout="'prev, total, next'"
        :current-page.sync="currentPage"
        :page-size="pageAmount"
        :total="filteredItems.length"
        @prev-click="handlePrevClick"
        @next-click="handleNextClick"
      />
    </div>
    <div class="buttons-container">
      <s-button type="secondary" class="s-typography-button--big" @click.stop="previousStage">
        {{ t('adar.routeAssets.back') }}
      </s-button>
      <div class="total-container">
        <span>{{ t('adar.routeAssets.total') }}:&nbsp;</span>
        <span class="usd">{{ overallUSDNumber }}</span>
      </div>
      <s-button type="primary" class="s-typography-button--big" @click.stop="onContinueClick">
        {{ t('adar.routeAssets.continue') }}
      </s-button>
    </div>
    <select-token :visible.sync="showSelectInputAssetDialog" :connected="isLoggedIn" @select="onInputAssetSelected" />
  </div>
</template>

<script lang="ts">
import { FPNumber } from '@sora-substrate/sdk';
import { components, mixins } from '@soramitsu/soraneo-wallet-web';
import { Component, Mixins } from 'vue-property-decorator';

import TranslationMixin from '@/components/mixins/TranslationMixin';
import { Components, PageNames } from '@/consts';
import { AdarComponents } from '@/modules/ADAR/consts';
import { adarLazyComponent } from '@/modules/ADAR/router';
import router, { lazyComponent } from '@/router';
import { action, getter, mutation } from '@/store/decorators';
import { Recipient } from '@/store/routeAssets/types';
import validate from '@/store/routeAssets/utils';
import { copyToClipboard, formatAddress } from '@/utils';

import type { Asset } from '@sora-substrate/sdk/build/assets/types';
@Component({
  components: {
    GenericPageHeader: lazyComponent(Components.GenericPageHeader),
    SelectInputAssetDialog: adarLazyComponent(AdarComponents.RouteAssetsSelectInputAssetDialog),
    TokenLogo: components.TokenLogo,
    SearchInput: components.SearchInput,
    SelectToken: lazyComponent(Components.SelectToken),
  },
})
export default class TransactionOverview extends Mixins(TranslationMixin, mixins.PaginationSearchMixin) {
  @getter.routeAssets.recipients recipients!: Array<any>;
  @action.routeAssets.setInputToken setInputToken!: (asset: Asset) => void;
  @action.routeAssets.processingNextStage nextStage!: any;
  @action.routeAssets.processingPreviousStage previousStage!: any;
  @getter.wallet.account.isLoggedIn isLoggedIn!: boolean;
  @getter.routeAssets.overallUSDNumber overallUSDNumber!: string;
  @mutation.routeAssets.toggleUseTransfer toggleUseTransfer!: (id: string) => void;

  showSelectInputAssetDialog = false;

  async handleCopyAddress(address): Promise<void> {
    try {
      await copyToClipboard(address);
      this.$notify({
        message: `${this.t('account.successCopy')}`,
        type: 'success',
        title: '',
      });
    } catch (error) {
      this.$notify({
        message: `${this.t('warningText')} ${error}`,
        type: 'warning',
        title: '',
      });
    }
  }

  pageAmount = 10;

  onUseTransferClick(id: string) {
    this.toggleUseTransfer(id);
  }

  onContinueClick() {
    if (this.isLoggedIn) {
      this.nextStage();
      return;
    }
    this.handleConnectWallet();
  }

  handleConnectWallet(): void {
    router.push({ name: PageNames.Wallet });
  }

  formatAddress(wallet: string) {
    return formatAddress(wallet, 10);
  }

  onInputAssetSelected(asset: Asset) {
    this.setInputToken(asset);
    this.showSelectInputAssetDialog = false;
    this.nextStage();
  }

  getStatus(recipient: Recipient) {
    return validate.wallet(recipient.wallet)
      ? this.t('adar.routeAssets.txStatus.addressValid')
      : this.t('adar.routeAssets.txStatus.addressInvalid');
  }

  getStatusClass(recipient: Recipient) {
    return !validate.wallet(recipient.wallet) ? 'invalid' : 'success';
  }

  getAmount(recipient: Recipient) {
    return this.formatNumber(recipient.amount ? recipient.amount : FPNumber.ZERO);
  }

  getInitials(recipient: Recipient) {
    return recipient.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 3)
      .join('');
  }

  formatNumber(num: FPNumber, dp = 4) {
    return num.toLocaleString(dp);
  }

  handleResetSearch(): void {
    this.resetPage();
    this.resetSearch();
  }

  get filteredItems() {
    const search = this.query.toLowerCase().trim();

    if (!search) return this.recipients;
    return (
      this.recipients?.filter((recipient) => recipient.name.toLowerCase().includes(this.query.toLowerCase())) || []
    );
  }

  get tableData() {
    return this.getPageItems(this.filteredItems?.map((item, idx) => ({ num: idx + 1, ...item }))) || [];
  }
}
</script>

<style lang="scss">
.routing-template-transactions {
  .transactions-table.el-table {
    @include routes-table;
    text-align: left;

    tr {
      cursor: default;
      button {
        cursor: default;
      }
    }
    td .ellipsis {
      @include text-ellipsis;
    }
    .usd-column {
      &__data {
        color: var(--s-color-fiat-value);
      }
      &__data::before {
        content: '$';
        display: inline;
        margin-right: 4px;
      }
    }

    .wallet-address {
      width: 100%;

      > button {
        width: 100%;
        padding: 0;
        text-transform: none;

        i {
          display: none;
        }
      }
    }
  }
  .status-property {
    &__data {
      display: flex;
    }
    &__label {
      text-transform: uppercase;
      white-space: nowrap;
      &_success::after {
        content: '✓';
        display: inline;
        color: var(--s-color-status-success);
      }
      &_invalid::after {
        content: '✕';
        display: inline;
        color: var(--s-color-status-error);
      }
    }
  }

  .token-logo {
    > span {
      width: 24px;
      height: 24px;
    }
  }

  .transactions-table-pagination {
    @include pagination;
  }

  .buttons-container {
    @include flex-between;
    margin-top: 16px;

    button {
      width: 200px;
    }
  }
}
</style>

<style scoped lang="scss">
.checkbox-no-actions {
  cursor: default;
  pointer-events: none;
}

.container {
  max-width: none;
}
.routing-template-transactions {
  font-weight: 600;
  font-size: var(--s-font-size-medium);

  &__header {
    @include flex-between;
  }

  &__search {
    width: 300px;
  }
  @include large-desktop(true) {
    margin-left: 200px;
  }
  @include tablet(true) {
    max-width: 85%;
    margin-left: auto;
    margin-right: auto;
  }

  @include mobile(true) {
    max-width: 100%;
  }
}

.ellipsis {
  @include text-ellipsis;
}

.wallet-tooltip {
  @include flex-start;
  display: inline-flex;
  gap: 4px;
}

.name-label {
  border: 1px solid #e2e8f0;
  border-radius: 1000px;
  background: #334155;
  width: 32px;
  height: 32px;
  color: white;
  font-size: 9px;
  @include flex-center;
}

.in-tokens {
  &__asset {
    @include flex-start;
    gap: 8px;
    white-space: nowrap;
  }
  @include tablet(true) {
    &__asset {
      font-size: 10px;
    }
  }
}

.total-container {
  color: var(--s-color-brand-day);
  text-transform: uppercase;
  .usd {
    color: var(--s-color-fiat-value);
    &::before {
      content: ' $';
      display: inline;
    }
  }
}

.tx-type {
  text-transform: uppercase;
}
</style>
