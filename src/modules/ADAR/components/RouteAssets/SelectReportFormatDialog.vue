<template>
  <div class="select-report-fromat-dialog">
    <dialog-base :visible.sync="isVisible" custom-class="dialog__select-report-format">
      <div class="route-assets__page-header-title">{{ t('adar.routeAssets.dialogs.reportDialog.title') }}</div>
      <div class="route-assets__page-header-description">
        {{ t('adar.routeAssets.dialogs.reportDialog.description') }}
      </div>
      <div class="buttons-container">
        <s-button type="primary" class="s-typography-button--big browse-button" @click.stop="onPDFSelect">
          {{ t('adar.routeAssets.dialogs.reportDialog.pdf') }}
        </s-button>
        <s-button type="primary" class="s-typography-button--big browse-button" @click.stop="onCSVSelect">
          {{ t('adar.routeAssets.dialogs.reportDialog.csv') }}
        </s-button>
      </div>
    </dialog-base>
  </div>
</template>

<script lang="ts">
import { mixins, components } from '@soramitsu/soraneo-wallet-web';
import { Component, Mixins } from 'vue-property-decorator';
@Component({
  components: {
    DialogBase: components.DialogBase,
  },
})
export default class SelectReportFormatDialog extends Mixins(mixins.TransactionMixin, mixins.DialogMixin) {
  onPDFSelect() {
    this.$emit('onPDFSelect');
    this.$emit('update:visible', false);
  }

  onCSVSelect() {
    this.$emit('onCSVSelect');
    this.$emit('update:visible', false);
  }
}
</script>

<style lang="scss" scoped>
.route-assets__page-header-description {
  margin: $inner-spacing-medium 0;
}
.browse-button {
  width: 100%;
  margin-right: 0;
  margin-left: 0;
}

.buttons-container {
  display: flex;
  // flex-direction: column;
  gap: 12px;
  margin-bottom: $inner-spacing-medium;
}
</style>
