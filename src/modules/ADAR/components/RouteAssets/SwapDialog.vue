<template>
  <div class="swap-dialog">
    <dialog-base :visible.sync="isVisible" :title="'Swap'" custom-class="dialog__swap">
      <Swap ref="swap" />
    </dialog-base>
  </div>
</template>

<script lang="ts">
import { FPNumber, NetworkFeesObject, Operation } from '@sora-substrate/util/build';
import { XOR } from '@sora-substrate/util/build/assets/consts';
import { mixins, components } from '@soramitsu/soraneo-wallet-web';
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';

import { Components } from '@/consts';
import { lazyComponent } from '@/router';
import { state } from '@/store/decorators';
import type { PresetSwapData } from '@/store/routeAssets/types';
// import Swap from '@/views/Swap.vue';

@Component({
  components: {
    DialogBase: components.DialogBase,
    Swap: lazyComponent(Components.SwapFormWidget),
  },
})
export default class SwapDialog extends Mixins(mixins.TransactionMixin, mixins.DialogMixin) {
  @state.wallet.settings.networkFees private networkFees!: NetworkFeesObject;

  @Prop({ default: 0 }) presetSwapData!: PresetSwapData;

  get roundedValueTo() {
    const { valueTo } = this.presetSwapData;
    return new FPNumber(Math.ceil((valueTo.toNumber() + Number.EPSILON) * 10000) / 10000);
  }

  get networkSwapFee(): FPNumber {
    return FPNumber.fromCodecValue(this.networkFees[Operation.Swap]);
  }

  @Watch('visible')
  onVisibleChanged(newVal) {
    if (newVal) {
      this.$nextTick(async () => {
        const swapComponent = this.$refs.swap as any;
        if (swapComponent) {
          const { assetFrom, assetTo } = this.presetSwapData;
          const isAssetToXor = assetTo.symbol === XOR.symbol;
          const fieldToValue = isAssetToXor ? this.roundedValueTo.add(this.networkSwapFee) : this.roundedValueTo;
          swapComponent.isTokenFromSelected = false;
          await swapComponent.handleSelectToken(assetTo);
          swapComponent.isTokenFromSelected = true;
          await swapComponent.handleSelectToken(assetFrom);
          swapComponent.handleInputFieldTo(`${fieldToValue.toNumber()}`);
          swapComponent.handleFocusField(true);
        }
      });
    }
  }
}
</script>

<style lang="scss">
.dialog__swap {
  z-index: 3000 !important;
  .el-dialog {
    max-width: 500px;
    padding: 20px;
    &__body {
      padding: 0 !important;
    }
  }
  .container {
    box-shadow: none;
  }

  .base-widget-block.base-widget-header {
    display: none;
  }
}
</style>

<style lang="scss" scoped>
.browse-button {
  width: 100%;
  margin-bottom: 16px;
  margin-top: 24px;
}
</style>
