<template>
  <div v-loading="parentLoading" class="route-assets">
    <component :is="component"></component>
    <adar-stats v-if="showAdarStats" class="adar-stat-cards"></adar-stats>
    <!-- <div class="stat-cards">
      <stats-card class="adar-stat-widget">
        <template #title>
          <div slot="header" class="stats-card-title">
            <span>Transactions</span>
            <s-tooltip border-radius="mini" :content="'gggggggg'">
              <s-icon name="info-16" size="14px" />
            </s-tooltip>
          </div>
        </template>
        <div class="stats-card-value">{{ totalTransactionsCount }}</div>
      </stats-card>
      <stats-card class="adar-stat-widget">
        <template #title>
          <div slot="header" class="stats-card-title">
            <span>Unique Recipients</span>
            <s-tooltip border-radius="mini" :content="'gggggggg'">
              <s-icon name="info-16" size="14px" />
            </s-tooltip>
          </div>
        </template>
        <div class="stats-card-value">{{ uniqueRecipients }}</div>
      </stats-card>
      <stats-card class="adar-stat-widget">
        <template #title>
          <div slot="header" class="stats-card-title">
            <span>USD</span>
            <s-tooltip border-radius="mini" :content="'gggggggg'">
              <s-icon name="info-16" size="14px" />
            </s-tooltip>
          </div>
        </template>
        <div class="stats-card-value">${{ usdVolume }}</div>
      </stats-card>
    </div> -->
    <!-- <div class="temp-div">
      <s-button
        type="primary"
        class="s-typography-button--big route-assets-upload-csv__button"
        @click.stop="previousStage"
      >
        {{ 'Previous step' }}
      </s-button>
      <s-button
        type="secondary"
        class="s-typography-button--big route-assets-upload-csv__button"
        @click.stop="nextStage"
      >
        {{ 'Next step' }}
      </s-button>
    </div> -->
  </div>
</template>

<script lang="ts">
import { Operation, TransactionStatus, FPNumber } from '@sora-substrate/util';
import { mixins, api } from '@soramitsu/soraneo-wallet-web';
import { ExternalHistoryParams } from '@soramitsu/soraneo-wallet-web/lib/types/history';
import { Component, Mixins, Watch } from 'vue-property-decorator';

import TranslationMixin from '@/components/mixins/TranslationMixin';
import { Components } from '@/consts';
import { AdarComponents, Stages } from '@/modules/ADAR/consts';
import { fetchData } from '@/modules/ADAR/indexer/queries/adarStats';
import { adarLazyComponent } from '@/modules/ADAR/router';
import { lazyComponent } from '@/router';
import { getter, action, mutation, state } from '@/store/decorators';
import { getTokenEquivalent, getAssetUSDPrice } from '@/store/routeAssets/utils';
import { FeatureFlags } from '@/store/settings/types';

import AdarStats from '../components/Stats/adarStats.vue';

import type { HistoryItem } from '@sora-substrate/util';
import type { WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';

@Component({
  components: {
    Authorize: adarLazyComponent(AdarComponents.RouteAssetsAuthorize),
    Done: adarLazyComponent(AdarComponents.RouteAssetsDone),
    ProcessTemplate: adarLazyComponent(AdarComponents.RouteAssetsProcessTemplate),
    ReviewDetails: adarLazyComponent(AdarComponents.RouteAssetsReviewDetails),
    Routing: adarLazyComponent(AdarComponents.RouteAssetsRouting),
    TransactionOverview: adarLazyComponent(AdarComponents.RouteAssetsTransactionOverview),
    UploadTemplate: adarLazyComponent(AdarComponents.RouteAssetsUploadTemplate),
    AdarStats,
  },
})
export default class RouteAssets extends Mixins(mixins.LoadingMixin, TranslationMixin) {
  @action.routeAssets.subscribeOnReserves private subscribeOnReserves!: () => void;
  @action.routeAssets.cleanSwapReservesSubscription private cleanSwapReservesSubscription!: () => void;
  @mutation.settings.setFeatureFlags private setFeatureFlags!: (data: FeatureFlags) => void;
  @getter.routeAssets.txHistoryStoreItem txHistoryStoreItem!: HistoryItem;
  @mutation.routeAssets.updateTxHistoryData private updateTxHistoryData!: (data: Nullable<HistoryItem>) => void;
  @action.wallet.transactions.getExternalHistory private getExternalHistory!: (
    args?: ExternalHistoryParams
  ) => Promise<void>;

  @mutation.wallet.transactions.getHistory private getHistory!: FnWithoutArgs;
  @state.wallet.transactions.history private historyObject!: any;
  @state.wallet.account.address private address!: string;
  @state.wallet.account.whitelistArray whitelistArray!: Array<WhitelistArrayItem>;
  @state.wallet.account.fiatPriceObject fiatPriceObject!: any;

  @getter.routeAssets.currentStageComponentName currentStageComponentName!: string;
  @action.routeAssets.processingNextStage nextStage!: any;
  @action.routeAssets.processingPreviousStage previousStage!: any;

  // statsArray: any[] = [];

  created() {
    this.withApi(async () => {
      this.subscribeOnReserves();
      this.setFeatureFlags({ charts: false, moonpay: false });
      // this.getHistory();
      // this.statsArray = await fetchData();
    });
  }

  beforeDestroy(): void {
    this.cleanSwapReservesSubscription();
  }

  get showAdarStats() {
    return this.component === Stages[0].component;
  }

  get component() {
    return this.currentStageComponentName;
  }

  @Watch('txHistoryStoreItem', { deep: true, immediate: true })
  private handleTxHistoryItem(value: HistoryItem): void {
    if (!value) return;
    this.updateTxHistoryData(value);
  }
}
</script>

<style lang="scss">
.route-assets {
  max-width: 988px;
  margin-left: auto;
  margin-right: auto;
  .container {
    margin: 0 auto $inner-spacing-medium;
    max-width: 464px;
  }

  &__page-header-title {
    font-weight: 600;
    font-size: 28px;
    line-height: var(--s-line-height-small);
    text-align: center;
    letter-spacing: -0.02em;
    font-feature-settings: 'case' on;
    color: var(--s-color-base-content-primary);
  }

  &__page-header-description {
    font-weight: 300;
    font-size: var(--s-font-size-small);
    line-height: var(--s-line-height-medium);
  }

  &__ref {
    color: var(--s-color-theme-accent);
    text-decoration: underline;
  }
  .fields-container {
    > div {
      margin-bottom: 0;
    }
    .el-divider {
      margin-bottom: $inner-spacing-medium;
      margin-top: 4px;
    }
    .field {
      text-transform: uppercase;
      font-weight: 300;
      font-size: 13px;
      @include flex-between;
      position: relative;

      .warning-message {
        position: absolute;
        left: 0;
        bottom: 0;
        margin-bottom: -16px;
      }

      &__status {
        display: flex;
        justify-content: flex-end;
        align-items: center;

        &_error {
          color: var(--s-color-status-error);
          font-weight: 600;
          fill: var(--s-color-status-error);
        }

        &_success {
          color: var(--s-color-status-success);
          font-weight: 600;
          fill: var(--s-color-status-success);
        }
        i {
          font-size: 16px !important;
          color: inherit;
        }
      }

      &__value {
        font-weight: 600;
        font-size: 13px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 4px;

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
        &_routed,
        &_success {
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
        &_waiting {
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
}
</style>

<style lang="scss" scoped>
.temp-div {
  width: 800px;
  margin: 0 auto;
  @include flex-between;

  button {
    display: block;
    margin: 0;
  }
}

.adar-stat-cards {
  position: absolute;
  right: 24px;
  top: 24px;
}
</style>
