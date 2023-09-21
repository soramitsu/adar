<template>
  <header class="header">
    <s-button class="app-menu-button" type="action" primary icon="basic-more-horizontal-24" @click="toggleMenu" />
    <app-logo-button class="app-logo--header" responsive :theme="libraryTheme" @click="goTo(PageNames.Swap)" />
    <!-- <div
      v-if="moonpayEnabled"
      class="app-controls app-controls--moonpay s-flex"
      :class="{ 'app-controls--moonpay--dark': themeIsDark }"
    > -->
    <!-- <s-button
        type="tertiary"
        size="medium"
        icon="various-atom-24"
        class="moonpay-button moonpay-button--buy"
        @click="openMoonpayDialog"
      >
        <span class="moonpay-button-text">{{ t('moonpay.buttons.buy') }}</span>
      </s-button>
    </div>
    <div class="app-controls s-flex">
      <app-account-button :disabled="loading" @click="goTo(PageNames.Wallet)" />
      <app-header-menu />
    </div>
      <moonpay-history-button v-if="isLoggedIn" class="moonpay-button moonpay-button--history" /> -->
    <!-- </div> -->
    <route-assets-navigation v-if="showRouteAssetsNavigation" class="app-controls s-flex route-assets-navigation" />
    <div class="s-flex app-controls">
      <balance-widget class="app-controls s-flex balance-widget" />
      <div class="app-controls app-controls--settings-panel s-flex without-moonpay">
        <!-- <market-maker-countdown /> -->
        <!-- <s-button type="action" class="node-control s-pressed" :tooltip="nodeTooltip" @click="openNodeSelectionDialog">
        <token-logo class="node-control__logo token-logo" v-bind="nodeLogo" />
      </s-button> -->
        <app-account-button :disabled="loading" @click="goTo(PageNames.Wallet)" />
        <app-header-menu />
      </div>
    </div>

    <select-language-dialog />
  </header>
</template>

<script lang="ts">
import { XOR, ETH } from '@sora-substrate/util/build/assets/consts';
import { components, WALLET_CONSTS } from '@soramitsu/soraneo-wallet-web';
import { Component, Mixins, Prop } from 'vue-property-decorator';

import WalletConnectMixin from '@/components/mixins/WalletConnectMixin';
import { PageNames, Components, BreakpointClass } from '@/consts';
import { AdarComponents } from '@/modules/ADAR/consts';
import { adarLazyComponent } from '@/modules/ADAR/router';
import { lazyComponent, goTo } from '@/router';
import { getter, mutation, state } from '@/store/decorators';

import AppAccountButton from './AppAccountButton.vue';
import AppHeaderMenu from './AppHeaderMenu.vue';
import AppLogoButton from './AppLogoButton.vue';
import AppMarketing from './AppMarketing.vue';

import type Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';

@Component({
  components: {
    AppAccountButton,
    AppMarketing,
    AppHeaderMenu,
    AppLogoButton,
    SelectLanguageDialog: lazyComponent(Components.SelectLanguageDialog),
    PairTokenLogo: lazyComponent(Components.PairTokenLogo),
    RouteAssetsNavigation: adarLazyComponent(AdarComponents.RouteAssetsNavigation),
    BalanceWidget: adarLazyComponent(AdarComponents.BalanceWidget),
    TokenLogo: components.TokenLogo,
    WalletAvatar: components.WalletAvatar,
  },
})
export default class AppHeader extends Mixins(WalletConnectMixin) {
  readonly PageNames = PageNames;
  readonly xor = XOR;
  readonly eth = ETH;

  @Prop({ type: Boolean, default: false }) readonly loading!: boolean;

  @state.settings.screenBreakpointClass private screenBreakpointClass!: BreakpointClass;

  @getter.libraryTheme libraryTheme!: Theme;

  goTo = goTo;

  get isMobile(): boolean {
    return this.screenBreakpointClass === BreakpointClass.Mobile;
  }

  get isAnyMobile(): boolean {
    return this.isMobile || this.screenBreakpointClass === BreakpointClass.LargeMobile;
  }

  get nodeLogo() {
    return {
      size: WALLET_CONSTS.LogoSize.MEDIUM,
      tokenSymbol: XOR.symbol,
    };
  }

  get showRouteAssetsNavigation() {
    return this.$route.path.includes('route-assets');
  }

  get fiatBtnClass(): string[] {
    const base = ['app-controls-fiat-btn', 'active'];

    if (this.$route.name === PageNames.FiatDepositOptions) base.push('app-controls-fiat-btn--active', 's-pressed');

    return base;
  }

  get fiatBtnType(): string {
    return this.isAnyMobile ? 'action' : 'tertiary';
  }

  get fiatBtnSize(): string {
    return this.isAnyMobile ? 'mini' : 'small';
  }

  toggleMenu(): void {
    this.$emit('toggle-menu');
  }
}
</script>

<style lang="scss">
.app-controls-fiat-btn.app-controls-fiat-btn--active.neumorphic.active {
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
$app-controls-filter: drop-shadow(-5px -5px 5px rgba(232, 25, 50, 0.05))
  drop-shadow(1px 1px 25px rgba(232, 25, 50, 0.1));
$app-controls-shadow: inset 1px 1px 10px #ffffff;

$app-controls-filter--dark: drop-shadow(-5px -5px 5px rgba(232, 25, 50, 0.05))
  drop-shadow(2px 2px 10px rgba(232, 25, 49, 0.33));
$app-controls-shadow--dark: inset 1px 1px 2px #52523d;
.header {
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
}

.app-controls {
  &.route-assets-navigation {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    @include tablet(true) {
      display: none;
    }
    @media (max-width: 1550px) and (min-width: 1440px) {
      left: 40%;
    }
  }

  .balance-widget {
    @media (max-width: 1200px) {
      display: none;
    }
  }

  &:not(:last-child) {
    margin-right: $inner-spacing-mini;
  }

  .node-control {
    @include element-size('token-logo', 32px);
    &__logo {
      display: block;
      margin: auto;
    }
  }

  &-fiat-btn.s-action .payment-icon {
    margin: auto;
    margin-top: 2px; // Only for action button
  }

  .el-button {
    + .el-button {
      margin-left: 0;
    }
  }

  @include desktop {
    // margin-left: auto;
  }

  &--middle {
    margin-left: auto;
    box-shadow: $app-controls-shadow;
    filter: $app-controls-filter;
    border-radius: var(--s-border-radius-small);

    & > * {
      box-shadow: none !important;
    }

    @include desktop {
      position: absolute;
      top: 50%;
      left: 42.5%; // Because of marketing banner
      transform: translate(-50%, -50%);
      margin-right: 0;
    }

    @media (minmax(1220px, false)) {
      left: 50%;
    }
  }

  &--settings-panel {
    filter: $app-controls-filter;
    border-radius: var(--s-border-radius-small);

    & > * {
      box-shadow: none !important;
    }
    & > *:not(:last-child) {
      margin-right: 1px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    & > *:not(:first-child) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }

  &--moonpay--dark,
  &--settings-panel--dark {
    box-shadow: $app-controls-shadow--dark;
    filter: $app-controls-filter--dark;
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
