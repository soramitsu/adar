<template>
  <dialog-base :visible.sync="visibility" :title="t('connectEthereumWalletText')" append-to-body>
    <extension-connection-list
      :wallets="wallets"
      :connected-wallet="evmProvider"
      :selected-wallet="selectedProvider"
      :selected-wallet-loading="!!evmProviderLoading"
      @select="handleSelectProvider"
    />
  </dialog-base>
</template>

<script lang="ts">
import { components } from '@soramitsu/soraneo-wallet-web';
import { Component, Mixins } from 'vue-property-decorator';

import WalletConnectMixin from '@/components/mixins/WalletConnectMixin';
import { state } from '@/store/decorators';
import { Provider } from '@/utils/ethers-util';

type EvmWalletInfo = {
  extensionName: string;
  title: string;
  logo: {
    src: string;
    alt: string;
  };
  installed?: boolean;
  installUrl?: string;
};

@Component({
  components: {
    DialogBase: components.DialogBase,
    ExtensionConnectionList: components.ExtensionConnectionList,
  },
})
export default class SelectProviderDialog extends Mixins(WalletConnectMixin) {
  @state.wallet.account.isDesktop private isDesktop!: boolean;
  @state.web3.selectProviderDialogVisibility private selectProviderDialogVisibility!: boolean;

  get visibility(): boolean {
    return this.selectProviderDialogVisibility;
  }

  set visibility(flag: boolean) {
    this.setSelectProviderDialogVisibility(flag);
  }

  get allowedProviders(): Provider[] {
    if (this.isDesktop) {
      return [Provider.WalletConnect];
    }

    return Object.keys(Provider).map((key) => Provider[key]);
  }

  get wallets(): EvmWalletInfo[] {
    return this.allowedProviders.map((provider) => {
      return {
        extensionName: provider,
        title: provider,
        chromeUrl: '',
        mozillaUrl: '',
        logo: {
          src: this.getEvmProviderIcon(provider),
          alt: provider,
        },
      };
    });
  }

  get selectedProvider(): Nullable<Provider> {
    return this.evmProviderLoading ?? this.evmProvider;
  }

  handleSelectProvider(wallet: EvmWalletInfo): void {
    this.connectEvmProvider(wallet.extensionName as Provider);
    this.visibility = false;
  }
}
</script>
