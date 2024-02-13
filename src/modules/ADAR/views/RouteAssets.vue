<template>
  <div v-loading="parentLoading || !adarDataLoaded" class="route-assets">
    <component :is="component"></component>
    <adar-stats v-if="showAdarStats" class="adar-stat-cards"></adar-stats>
  </div>
</template>

<script lang="ts">
import { Operation } from '@sora-substrate/util';
import { mixins } from '@soramitsu/soraneo-wallet-web';
import { ExternalHistoryParams } from '@soramitsu/soraneo-wallet-web/lib/types/history';
import isEmpty from 'lodash/fp/isEmpty';
import { Component, Mixins, Watch } from 'vue-property-decorator';

import TranslationMixin from '@/components/mixins/TranslationMixin';
import { AdarComponents, Stages } from '@/modules/ADAR/consts';
import { adarLazyComponent } from '@/modules/ADAR/router';
import { getter, action, mutation, state } from '@/store/decorators';
import { SwapTransferBatchStatus } from '@/store/routeAssets/types';
import { FeatureFlags } from '@/store/settings/types';

import AdarStats from '../components/Stats/adarStats.vue';

import type { AccountHistory, HistoryItem } from '@sora-substrate/util';
import type { WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import type { FiatPriceObject } from '@soramitsu/soraneo-wallet-web/lib/services/indexer/types';

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
  @state.wallet.account.whitelistArray private whitelistArray!: Array<WhitelistArrayItem>;
  @state.wallet.account.fiatPriceObject private fiatPriceObject!: FiatPriceObject;
  @state.wallet.account.address private address!: string;
  @getter.routeAssets.pricesAreUpdated private pricesAreUpdated!: boolean;
  @state.wallet.transactions.externalHistory private externalHistory!: AccountHistory<HistoryItem>;
  @state.wallet.transactions.externalHistoryUpdates private externalHistoryUpdates!: AccountHistory<HistoryItem>;
  @getter.routeAssets.txHistoryData txHistoryData!: HistoryItem;

  @getter.routeAssets.batchTxStatus batchTxStatus!: SwapTransferBatchStatus;
  @mutation.wallet.transactions.resetExternalHistory private resetExternalHistory!: FnWithoutArgs;
  @action.wallet.transactions.getExternalHistory private updateExternalHistory!: (
    args?: ExternalHistoryParams
  ) => Promise<void>;

  @getter.routeAssets.currentStageComponentName currentStageComponentName!: string;
  @action.routeAssets.processingNextStage nextStage!: any;
  @action.routeAssets.processingPreviousStage previousStage!: any;

  timerId: Nullable<NodeJS.Timeout> = null;

  created() {
    this.withApi(async () => {
      this.subscribeOnReserves();
      this.initTimer();
      this.setFeatureFlags({ charts: false, moonpay: false });
    });
  }

  beforeDestroy(): void {
    this.cleanSwapReservesSubscription();
    if (this.timerId) clearInterval(this.timerId);
  }

  initTimer() {
    this.timerId = setInterval(() => {
      if (this.pricesAreUpdated) this.subscribeOnReserves();
    }, 60_000);
  }

  get adarDataLoaded() {
    return !!this.whitelistArray.length && !isEmpty(this.fiatPriceObject);
  }

  get showAdarStats() {
    return this.component === Stages[0].component;
  }

  get component() {
    return this.currentStageComponentName;
  }

  get allowFetchHistory() {
    return this.txHistoryData?.status === 'finalized' && !this.txHistoryStoreItem;
  }

  async getHistoryElement() {
    await this.updateExternalHistory({
      page: 1,
      address: this.address,
      query: {
        operationNames: [Operation.SwapTransferBatch],
      },
    });
    const historyElement = this.externalHistory[this.txHistoryData.id as string];
    this.updateTxHistoryData(historyElement);
  }

  @Watch('txHistoryStoreItem', { deep: true, immediate: true })
  private handleTxHistoryItem(value: HistoryItem): void {
    if (!value) return;
    this.updateTxHistoryData(value);
  }

  @Watch('allowFetchHistory')
  private onStatusChanged(value) {
    if (value) {
      this.resetExternalHistory();
      this.getHistoryElement();
    }
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
  @include desktop(true) {
    display: none;
  }
}
</style>
