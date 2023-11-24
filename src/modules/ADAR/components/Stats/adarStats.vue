<template>
  <div class="adar-stats" v-if="adarTxs.length">
    <p class="adar-stats__title text-animation">ADAR community usage to date</p>
    <div class="stat-cards-container">
      <stats-card class="stats-card">
        <template #title>
          <div slot="header" class="stats-card__title">
            <span>Transactions</span>
            <s-tooltip border-radius="mini" :content="t('adar.adarStats.totalAdarTransactions')">
              <s-icon name="info-16" size="14px" />
            </s-tooltip>
          </div>
        </template>
        <div class="stats-card__value text-animation">{{ totalTransactionsCount }}</div>
      </stats-card>
      <stats-card v-if="uniqueRecipients" class="stats-card">
        <template #title>
          <div slot="header" class="stats-card__title">
            <span>Unique Recipients</span>
            <s-tooltip border-radius="mini" :content="t('adar.adarStats.uniqueRecipients')">
              <s-icon name="info-16" size="14px" />
            </s-tooltip>
          </div>
        </template>
        <div class="stats-card__value text-animation">{{ uniqueRecipients }}</div>
      </stats-card>
      <stats-card v-if="showUsdVolume" class="stats-card">
        <template #title>
          <div slot="header" class="stats-card__title">
            <span>USD</span>
            <s-tooltip border-radius="mini" :content="t('adar.adarStats.dollarEquivalentTokens')">
              <s-icon name="info-16" size="14px" />
            </s-tooltip>
          </div>
        </template>
        <div class="stats-card__value text-animation">${{ usdVolume.toLocaleString() }}</div>
      </stats-card>
    </div>
  </div>
</template>

<script lang="ts">
import { FPNumber } from '@sora-substrate/util';
import { mixins } from '@soramitsu/soraneo-wallet-web';
import { Component, Mixins } from 'vue-property-decorator';

import TranslationMixin from '@/components/mixins/TranslationMixin';
import { Components } from '@/consts';
import { fetchData } from '@/modules/ADAR/indexer/queries/adarStats';
import { lazyComponent } from '@/router';
import { state } from '@/store/decorators';
import { getAssetUSDPrice } from '@/store/routeAssets/utils';

import type { HistoryItem } from '@sora-substrate/util';
import type { WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';

@Component({
  components: {
    StatsCard: lazyComponent(Components.StatsCard),
  },
})
export default class AdarStats extends Mixins(mixins.LoadingMixin, TranslationMixin) {
  @state.wallet.account.whitelistArray whitelistArray!: Array<WhitelistArrayItem>;
  @state.wallet.account.fiatPriceObject fiatPriceObject!: any;

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

<style lang="scss" scoped>
.adar-stats {
  &__title {
    color: var(--s-color-base-content-secondary);
    font-size: var(--s-font-size-big);
    font-weight: 800;
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .stat-cards-container {
    gap: 16px;
    display: flex;
    flex-direction: column;
    align-items: end;

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
    }
  }
}

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
  text-fill-color: transparent;
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
