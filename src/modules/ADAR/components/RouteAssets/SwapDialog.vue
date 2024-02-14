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

import { state } from '@/store/decorators';
import type { PresetSwapData } from '@/store/routeAssets/types';
import Swap from '@/views/Swap.vue';

@Component({
  components: {
    DialogBase: components.DialogBase,
    Swap,
  },
})
export default class SwapDialog extends Mixins(mixins.TransactionMixin, mixins.DialogMixin) {
  @state.wallet.settings.networkFees private networkFees!: NetworkFeesObject;

  @Prop({ default: 0 }) presetSwapData!: PresetSwapData;

  get presetDataValueTo() {
    return this.presetSwapData?.valueTo;
  }

  roundNumber(num) {
    return Math.ceil((num + Number.EPSILON) * 100) / 100;
  }

  get networkSwapFee(): number {
    return FPNumber.fromCodecValue(this.networkFees[Operation.Swap]).toNumber();
  }

  @Watch('visible')
  onVisibleChanged(newVal) {
    if (newVal) {
      this.$nextTick(async () => {
        const swapComponent = this.$refs.swap as any;
        if (swapComponent) {
          const { assetFrom, assetTo, valueTo } = this.presetSwapData;
          const isAssetToXor = assetTo.symbol === XOR.symbol;
          const fieldToValue = isAssetToXor ? valueTo + this.networkSwapFee : valueTo;
          await swapComponent.setData({ firstAddress: assetFrom.address, secondAddress: assetTo.address });
          swapComponent.handleInputFieldTo(`${this.roundNumber(fieldToValue)}`);
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

  .page-header {
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
