<template>
  <div class="adar-stats">
    <s-skeleton :loading="!adarTxs.length" :throttle="0" animated>
      <template #template>
        <div class="stat-cards-container">
          <s-skeleton-item element="p" />
          <s-skeleton-item element="div" class="stats-card-sketeton" />
          <s-skeleton-item element="div" class="stats-card-sketeton" />
          <s-skeleton-item element="div" class="stats-card-sketeton" />
        </div>
      </template>
      <p class="adar-stats__title text-animation">{{ t('adar.adarStats.title') }}</p>
      <div class="stat-cards-container">
        <stats-card class="stats-card">
          <template #title>
            <div slot="header" class="stats-card__title">
              <span>{{ t('adar.adarStats.transactions') }}</span>
              <s-tooltip border-radius="mini" :content="t('adar.adarStats.totalAdarTransactions')">
                <s-icon name="info-16" size="14px" />
              </s-tooltip>
            </div>
          </template>
          <div class="stats-card__value text-animation">{{ totalTransactionsCount }}</div>
        </stats-card>
        <stats-card class="stats-card">
          <template #title>
            <div slot="header" class="stats-card__title">
              <span>{{ t('adar.adarStats.uniqueRecipients') }}</span>
              <s-tooltip border-radius="mini" :content="t('adar.adarStats.uniqueRecipients')">
                <s-icon name="info-16" size="14px" />
              </s-tooltip>
            </div>
          </template>
          <div v-if="uniqueRecipients" class="stats-card__value text-animation">{{ uniqueRecipients }}</div>
          <div v-else>
            <spinner />
          </div>
        </stats-card>
        <stats-card class="stats-card">
          <template #title>
            <div slot="header" class="stats-card__title">
              <span>{{ t('adar.routeAssets.usd') }}</span>
              <s-tooltip border-radius="mini" :content="t('adar.adarStats.dollarEquivalentTokens')">
                <s-icon name="info-16" size="14px" />
              </s-tooltip>
            </div>
          </template>
          <div v-if="showUsdVolume" class="stats-card__value text-animation">${{ usdVolume.toLocaleString(2) }}</div>
          <div v-else>
            <spinner />
          </div>
        </stats-card>
      </div>
    </s-skeleton>
  </div>
</template>

<script lang="ts">
import { FPNumber } from '@sora-substrate/util';
import { mixins } from '@soramitsu/soraneo-wallet-web';
import { SSkeleton, SSkeletonItem } from '@soramitsu-ui/ui-vue2/lib/components/Skeleton';
import { Component, Mixins } from 'vue-property-decorator';

import TranslationMixin from '@/components/mixins/TranslationMixin';
import { Components } from '@/consts';
import Spinner from '@/modules/ADAR/components/App/shared/InlineSpinner.vue';
import { fetchData } from '@/modules/ADAR/indexer/queries/adarStats';
import { lazyComponent } from '@/router';
import { state } from '@/store/decorators';
import { getAssetUSDPrice } from '@/store/routeAssets/utils';

import type { HistoryItem } from '@sora-substrate/util';
import type { WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import type { FiatPriceObject } from '@soramitsu/soraneo-wallet-web/lib/services/indexer/types';

@Component({
  components: {
    StatsCard: lazyComponent(Components.BaseWidget),
    SSkeleton,
    SSkeletonItem,
    Spinner,
  },
})
export default class AdarStats extends Mixins(mixins.LoadingMixin, TranslationMixin) {
  @state.wallet.account.whitelistArray private whitelistArray!: Array<WhitelistArrayItem>;
  @state.wallet.account.fiatPriceObject private fiatPriceObject!: FiatPriceObject;

  adarTxs: Array<HistoryItem> = [];

  created() {
    this.withApi(async () => {
      this.adarTxs = await fetchData();
    });
  }

  get showAdarStats() {
    return true;
  }

  get totalTransactionsCount() {
    return this.adarTxs.length;
  }

  get uniqueRecipients() {
    return [
      ...new Set(
        this.adarTxs.reduce((acc, item) => {
          const dat = item.payload?.receivers.map((receiver) => receiver.accountId) || [];
          return [...acc, ...dat];
        }, [] as Array<HistoryItem>)
      ),
    ].length;
  }

  get usdVolume() {
    return this.adarTxs.reduce((acc, item) => {
      if (item.payload?.comment?.rates) {
        const sum = item.payload?.receivers.reduce((result, receiver) => {
          const rate = item.payload?.comment?.rates[receiver.asset.symbol];
          return rate ? result.add(new FPNumber(rate).mul(receiver.amount)) : result;
        }, FPNumber.ZERO);
        return sum;
      }
      const assetsTable = this.whitelistArray;
      const asset = assetsTable.find((asset) => asset.address === item.assetAddress);
      const price = getAssetUSDPrice(asset, this.fiatPriceObject);
      const usd = item?.amount ? price.mul(new FPNumber(item.amount)) : FPNumber.ZERO;
      return acc.add(usd);
    }, FPNumber.ZERO);
  }

  get showUsdVolume() {
    return !this.usdVolume.isNaN();
  }
}
</script>

<style lang="scss">
.adar-stats {
  &__title {
    color: var(--s-color-base-content-secondary);
    font-size: var(--s-font-size-small);
    font-weight: 800;
    text-transform: uppercase;
    margin-bottom: 16px;
    max-width: 255px;
  }
  .stat-cards-container {
    gap: 16px;
    display: flex;
    flex-direction: column;
    align-items: end;

    .base-widget-header,
    .base-widget-content {
      padding: 0;
    }

    .stats-card {
      width: 230px;
      &__title {
        display: flex;
        align-items: center;
        gap: $inner-spacing-mini;

        color: var(--s-color-base-content-secondary);
        font-size: var(--s-font-size-small);
        font-weight: 800;
        text-transform: uppercase;
      }
      &__data {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        margin-top: $inner-spacing-small;
      }
      &__value {
        font-size: var(--s-font-size-big);
        font-weight: 800;
      }
      &-sketeton {
        width: 230px;
        height: 94px;
      }

      &.s-card.neumorphic.s-size-big {
        padding: 16px 24px;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.text-animation {
  background: linear-gradient(
    to right,
    var(--s-color-base-content-secondary) 20%,
    var(--s-color-base-content-primary) 40%,
    var(--s-color-base-content-primary) 60%,
    var(--s-color-base-content-secondary) 80%
  );
  background-size: 200% auto;

  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  animation: shine 3s linear infinite;
  @keyframes shine {
    to {
      background-position: 200% center;
    }
  }
}
</style>
