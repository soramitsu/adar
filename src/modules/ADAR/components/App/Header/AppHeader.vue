<template>
  <header class="adar-header">
    <s-button class="app-menu-button" type="action" primary icon="basic-more-horizontal-24" @click="toggleMenu" />
    <app-logo-button
      class="app-logo--header"
      responsive
      :theme="libraryTheme"
      @click="goTo(AdarPageNames.RouteAssets)"
    />
    <route-assets-navigation v-if="showRouteAssetsNavigation" class="s-flex route-assets-navigation" />
    <div class="s-flex">
      <balance-widget class="balance-widget" />
      <app-header-menu :disabled="loading" />
    </div>

    <select-language-dialog />
  </header>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import AppLogoButton from '@/components/App/Header/AppLogoButton.vue';
import WalletConnectMixin from '@/components/mixins/WalletConnectMixin';
import { Components } from '@/consts';
import { AdarComponents, AdarPageNames } from '@/modules/ADAR/consts';
import { adarLazyComponent } from '@/modules/ADAR/router';
import { lazyComponent, goTo } from '@/router';
import { getter } from '@/store/decorators';

import AppHeaderMenu from './AppHeaderMenu.vue';

import type Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';

@Component({
  components: {
    AppHeaderMenu,
    AppLogoButton,
    SelectLanguageDialog: lazyComponent(Components.SelectLanguageDialog),
    RouteAssetsNavigation: adarLazyComponent(AdarComponents.RouteAssetsNavigation),
    BalanceWidget: adarLazyComponent(AdarComponents.BalanceWidget),
  },
})
export default class AppHeader extends Mixins(WalletConnectMixin) {
  readonly AdarPageNames = AdarPageNames;

  @Prop({ type: Boolean, default: false }) readonly loading!: boolean;

  @getter.libraryTheme libraryTheme!: Theme;

  goTo = goTo;

  get showRouteAssetsNavigation() {
    return this.$route.path.includes('route-assets');
  }

  toggleMenu(): void {
    this.$emit('toggle-menu');
  }
}
</script>

<style lang="scss">
.adar-app-controls-fiat-btn.adar-app-controls-fiat-btn--active.neumorphic.active {
  box-shadow: var(--s-shadow-element);
  span {
    color: var(--s-color-theme-accent);
  }
}

.settings-control:hover > span > .header-menu__button i {
  color: var(--s-color-base-content-secondary);
}
</style>

<style lang="scss" scoped>
.adar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $inner-spacing-mini;
  min-height: $header-height;
  position: relative;
  &:after {
    content: '';
    position: absolute;
    height: 1px;
    bottom: 0;
    left: $inner-spacing-mini;
    right: $inner-spacing-mini;
    background-color: var(--s-color-base-border-secondary);
  }
  @include tablet {
    padding: $inner-spacing-mini $inner-spacing-medium;

    &:after {
      left: $inner-spacing-medium;
      right: $inner-spacing-medium;
    }
  }

  .route-assets-navigation {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    @include tablet(true) {
      display: none;
    }
  }

  .balance-widget {
    margin-right: 12px;
    @media (max-width: 1200px) {
      display: none;
    }
  }
}

.app-menu-button {
  flex-shrink: 0;

  @include large-mobile {
    display: none;
  }
}

.app-logo--header {
  @include large-mobile(true) {
    display: none;
  }
}
</style>
