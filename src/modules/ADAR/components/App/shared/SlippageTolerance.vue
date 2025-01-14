<template>
  <div class="adar-slippage-tolerance" :class="computedClasses">
    <s-collapse @change="handleCollapseChange">
      <s-collapse-item>
        <template #title>
          <info-line
            :label="t('dexSettings.slippageTolerance')"
            :label-tooltip="t('dexSettings.slippageToleranceHint')"
            :value="localeFormattedSlippageTolerance"
          />
        </template>
        <div class="adar-slippage-tolerance s-flex">
          <div class="adar-slippage-tolerance-default">
            <settings-tabs :value="slippageTolerance" :tabs="SlippageToleranceTabs" @input="selectTab" />
          </div>
          <div class="adar-slippage-tolerance-custom">
            <s-float-input
              class="adar-slippage-tolerance-custom_input"
              size="small"
              :decimals="2"
              has-locale-string
              :delimiters="delimiters"
              :max="slippageToleranceExtremeValues.max"
              v-model="customSlippageTolerance"
              @blur="handleSlippageToleranceOnBlur"
              @focus="handleSlippageToleranceOnFocus"
            />
          </div>
        </div>
      </s-collapse-item>
    </s-collapse>
  </div>
</template>

<script lang="ts">
import { FPNumber } from '@sora-substrate/sdk';
import { components, mixins } from '@soramitsu/soraneo-wallet-web';
import { Component, Mixins, Prop } from 'vue-property-decorator';

import TranslationMixin from '@/components/mixins/TranslationMixin';
import { Components } from '@/consts';
import { lazyComponent } from '@/router';

@Component({
  components: {
    SettingsTabs: lazyComponent(Components.SettingsTabs),
    InfoLine: components.InfoLine,
  },
})
export default class AdarSlippageTolerance extends Mixins(mixins.NumberFormatterMixin, TranslationMixin) {
  @Prop({ default: () => ['0.1', '0.5', '1'] }) slippages!: Array<string>;
  @Prop({ default: '1' }) slippageTolerance!: string;
  readonly delimiters = FPNumber.DELIMITERS_CONFIG;

  readonly slippageToleranceExtremeValues = {
    min: 0.01,
    max: 10,
  };

  slippageToleranceFocused = false;
  slippageToleranceOpened = true;

  get SlippageToleranceTabs() {
    return this.slippages?.map((name) => ({
      name: name,
      label: `${this.formatStringValue(name)}%`,
    }));
  }

  get localeFormattedSlippageTolerance() {
    return `${this.formatStringValue(this.slippageTolerance)}%`;
  }

  get customSlippageTolerance(): string {
    const suffix = this.slippageToleranceFocused ? '' : '%';

    return `${this.slippageTolerance}${suffix}`;
  }

  set customSlippageTolerance(value: string) {
    const prepared = this.prepareInputValue(value);
    this.setSlippageTolerance(prepared);
  }

  get computedClasses(): string {
    if (this.slippageToleranceOpened) return 'is-collapsed';
    return '';
  }

  get isErrorValue(): boolean {
    const slippageTolerance = Number(this.slippageTolerance);
    return (
      slippageTolerance < this.slippageToleranceExtremeValues.min ||
      slippageTolerance > this.slippageToleranceExtremeValues.max
    );
  }

  setSlippageTolerance(slippage: string) {
    this.$emit('onSlippageChanged', slippage);
  }

  selectTab(name: string): void {
    this.setSlippageTolerance(name);
  }

  prepareInputValue(value): string {
    let v = value.replace('%', '');

    if (v.length) {
      if (v[0] === '0' && v[1] === '0') {
        v = v.replace(/^0+(?=\d)/, '');
      }
    }

    return v;
  }

  handleSlippageToleranceOnBlur(): void {
    let value = this.slippageTolerance;
    if (
      FPNumber.lt(this.getFPNumber(this.slippageTolerance), this.getFPNumber(this.slippageToleranceExtremeValues.min))
    ) {
      value = `${this.slippageToleranceExtremeValues.min}`;
    }
    this.setSlippageTolerance(value);
    this.slippageToleranceFocused = false;
  }

  handleSlippageToleranceOnFocus(): void {
    this.slippageToleranceFocused = true;
  }

  handleCollapseChange(): void {
    this.slippageToleranceOpened = !this.slippageToleranceOpened;
  }
}
</script>

<style lang="scss">
.adar-slippage-tolerance .s-flex {
  margin-top: 0px !important;
}
.adar-slippage-tolerance {
  &-custom_input.s-input {
    @include focus-outline($focusWithin: true, $withOffset: true);
    min-height: var(--s-size-small);
    box-shadow: var(--s-shadow-element);

    &.s-focused {
      .el-input__inner {
        color: var(--s-color-theme-accent);
      }
    }

    .el-input > input {
      @include slippage-tolerance-tabs;
    }
  }

  &--error &-custom_input.s-input .el-input > input {
    &,
    &:focus {
      border-color: var(--s-color-status-error);
    }
  }

  .s-placeholder {
    display: none;
  }

  .el-form--actions & {
    margin-top: $inner-spacing-mini;
  }

  .el-collapse.neumorphic .el-icon-arrow-right {
    transition: transform 0.3s;

    margin-left: 6px;
    height: 15px;
    line-height: 15px;
    width: 15.8px;
    padding: 0;

    background-color: var(--s-color-base-content-tertiary);
    color: var(--s-color-base-on-accent) !important;
    border-radius: var(--s-border-radius-medium);
    font-size: 16px;
  }

  .el-collapse-item__header {
    height: 36px;
    position: relative;
  }

  .el-collapse-item__content {
    padding: 0 !important;
  }

  .el-collapse--item .is-active .el-collapse {
    background: none;
  }

  .info-line {
    font-size: 14px !important;
    font-weight: 300;
    border: none !important;

    &-value {
      color: var(--s-color-theme-accent);
    }

    .el-tooltip {
      margin-bottom: 2px;
    }
  }
}
</style>

<style lang="scss" scoped>
.adar-slippage-tolerance {
  width: 100%;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: $inner-spacing-mini;

  &-default {
    flex: 1;
  }

  &-custom {
    flex: 1;
    min-width: 100px;
  }

  &_validation {
    margin-top: $inner-spacing-mini;
    width: 100%;
    font-size: var(--s-font-size-mini);
    line-height: var(--s-line-height-big);
  }
  &--warning {
    color: var(--s-color-status-warning);
  }
  &--error {
    color: var(--s-color-status-error);
  }

  .value {
    display: flex;
    &-container {
      flex: 1;
      height: var(--s-size-small);
      line-height: var(--s-size-small);
      background-color: var(--s-color-base-background);
      border-radius: var(--s-border-radius-mini);
      font-size: var(--s-font-size-mini);
      text-align: center;
      font-weight: 700;
      &_label {
        color: var(--s-color-base-content-tertiary);
      }
      &:not(:last-child) {
        margin-right: $inner-spacing-medium;
      }
    }
    &-slider {
      flex: 2;
    }
  }
}

.is-collapsed .el-collapse {
  background: linear-gradient(0deg, var(--s-color-base-border-secondary) 1px, transparent 1px);
}
</style>
