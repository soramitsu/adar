<template>
  <header class="adar-header">
    <s-button class="app-menu-button" type="action" primary icon="basic-more-horizontal-24" @click="toggleMenu" />
    <app-logo-button class="app-logo--header" responsive :theme="libraryTheme" @click="goTo(PageNames.Swap)" />
    <route-assets-navigation v-if="showRouteAssetsNavigation" class="s-flex route-assets-navigation" />
    <div class="s-flex">
      <balance-widget class="balance-widget" />
      <app-header-menu :disabled="loading" />
    </div>

    <select-language-dialog />
  </header>
</template>

<script lang="ts">
import { XOR, ETH } from '@sora-substrate/util/build/assets/consts';
import { components, WALLET_CONSTS } from '@soramitsu/soraneo-wallet-web';
import { Component, Mixins, Prop } from 'vue-property-decorator';

import AppAccountButton from '@/components/App/Header/AppAccountButton.vue';
import AppLogoButton from '@/components/App/Header/AppLogoButton.vue';
import WalletConnectMixin from '@/components/mixins/WalletConnectMixin';
import { PageNames, Components, BreakpointClass } from '@/consts';
import { AdarComponents } from '@/modules/ADAR/consts';
import { adarLazyComponent } from '@/modules/ADAR/router';
import { lazyComponent, goTo } from '@/router';
import { getter, state } from '@/store/decorators';

import AppHeaderMenu from './AppHeaderMenu.vue';

import type Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';

@Component({
  components: {
    AppAccountButton,
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
    @media (max-width: 1550px) and (min-width: 1440px) {
      left: 40%;
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
