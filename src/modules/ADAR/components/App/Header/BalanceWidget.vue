<template>
  <div v-if="isLoggedIn && !shouldBalanceBeHidden" class="balance-widget">
    <div>{{ formattedBalance }}</div>
    <div>{{ tokenSymbol }}</div>
    <token-logo class="token-logo" :token="inputToken" size="small" />
  </div>
</template>

<script lang="ts">
import { CodecString, FPNumber } from '@sora-substrate/sdk/build';
import { RegisteredAccountAsset } from '@sora-substrate/sdk/build/assets/types';
import { components } from '@soramitsu/soraneo-wallet-web';
import { Component, Vue } from 'vue-property-decorator';

import { getter, state } from '@/store/decorators';
import { getAssetBalance } from '@/utils';

@Component({
  components: {
    TokenLogo: components.TokenLogo,
  },
})
export default class BalanceWidget extends Vue {
  @getter.routeAssets.inputToken inputToken!: RegisteredAccountAsset;
  @getter.wallet.account.isLoggedIn isLoggedIn!: boolean;
  @state.wallet.settings.shouldBalanceBeHidden shouldBalanceBeHidden!: boolean;

  get tokenSymbol() {
    return this.inputToken?.symbol;
  }

  get formattedBalance(): string {
    return this.fpBalance.toLocaleString(2);
  }

  get fpBalance(): FPNumber {
    if (!this.getTokenBalance) return FPNumber.ZERO;

    return FPNumber.fromCodecValue(this.getTokenBalance, this.inputToken?.decimals);
  }

  get getTokenBalance(): CodecString {
    return getAssetBalance(this.inputToken);
  }
}
</script>

<style lang="scss" scoped>
.balance-widget {
  display: flex;
  max-width: 200px;
  height: 42px;
  padding: 0px 4px;
  justify-content: center;
  align-items: center;
  gap: 4px;

  border-radius: 32px;
  background: var(--s-color-utility-body);
  box-shadow: var(--s-shadow-element);
  font-size: 14px;
  font-weight: 600;
  line-height: 14px;
  letter-spacing: -0.28px;
}
</style>
