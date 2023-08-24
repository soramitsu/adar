<template>
  <div class="select-report-fromat-dialog">
    <dialog-base :visible.sync="isVisible" custom-class="dialog__select-report-format">
      <div class="route-assets__page-header-title">{{ t('adar.routeAssets.dialogs.reportDialog.title') }}</div>
      <div class="route-assets__page-header-description">
        {{ t('adar.routeAssets.dialogs.reportDialog.description') }}
      </div>
      <div class="input-file-name-container">
        <s-input v-model="reportFileName" maxlength="20" :placeholder="t('nameText')" />
        <div class="options-container">
          <span v-for="(option, idx) in options" :key="idx" @click="onOptionClick(option)">
            {{ option }}
          </span>
        </div>
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

import { getter } from '@/store/decorators';
@Component({
  components: {
    DialogBase: components.DialogBase,
  },
})
export default class SelectReportFormatDialog extends Mixins(mixins.TransactionMixin, mixins.DialogMixin) {
  @getter.routeAssets.file inputFile!: File;

  get inputFileName() {
    return this.inputFile?.name.split('.csv')[0];
  }

  readonly initialFileName = `ADAR-${this.formatDate(new Date().getTime(), 'D_MMM_YY')}`;

  reportFileName = this.initialFileName;

  options: string[] = [];

  mounted() {
    this.options.push(this.initialFileName, `ADAR-${this.inputFileName}`);
  }

  onPDFSelect() {
    this.$emit('onPDFSelect', this.reportFileName);
    this.$emit('update:visible', false);
  }

  onCSVSelect() {
    this.$emit('onCSVSelect', this.reportFileName);
    this.$emit('update:visible', false);
  }

  onOptionClick(option: string) {
    this.reportFileName = option;
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
  margin-top: $inner-spacing-medium;
  gap: 12px;
  margin-bottom: $inner-spacing-medium;
}

.input-file-name-container {
  position: relative;

  .options-container {
    margin-top: $inner-spacing-mini;
    display: flex;
    gap: 8px;
    font-size: var(--s-font-size-mini);
    > span {
      cursor: pointer;
      opacity: 0.7;
      &::before {
        content: '•';
      }

      &:hover {
        text-decoration: underline;
        opacity: 1;
      }
    }
  }
}
</style>
