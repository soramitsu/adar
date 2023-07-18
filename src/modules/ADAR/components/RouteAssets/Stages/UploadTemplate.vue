<template>
  <div v-if="!parsingError" class="container route-assets-upload-template">
    <div class="route-assets__page-header-title">{{ t('adar.routeAssets.stages.uploadTemplate.title') }}</div>
    <div class="route-assets__page-header-description">
      {{ t('adar.routeAssets.stages.uploadTemplate.description') }}
    </div>
    <div
      @dragover="dragover"
      @dragleave="dragleave"
      @drop="drop"
      class="dropping-area"
      :class="{ 'drag-over': dragOver }"
    >
      <div>
        <s-icon class="icon-divider" name="arrows-arrow-top-24" />
      </div>
      <p class="dropping-area__description">{{ t('adar.routeAssets.stages.uploadTemplate.instruction') }}</p>
      <p>{{ t('adar.routeAssets.stages.uploadTemplate.typesInfo') }}</p>
      <div>
        <label
          class="
            file-upload
            s-typography-button--big
            route-assets-upload-template__button
            el-button el-tooltip
            button
            el-button--primary el-button--medium
            neumorphic
            s-medium s-border-radius-small s-primary
          "
        >
          <input type="file" @change="onInputChanged" ref="file" aria-label="false" accept=".csv" />
          {{ t('adar.routeAssets.stages.uploadTemplate.uploadButtonTitle') }}
        </label>
      </div>
    </div>
    <p class="route-assets-upload-template__label">
      {{ t('adar.routeAssets.stages.uploadTemplate.templateHelp') }}
      <a href="/adar/template.csv" download class="route-assets__ref">{{
        t('adar.routeAssets.stages.uploadTemplate.download')
      }}</a>
    </p>
    <input type="file" @change="onInputChanged" ref="file" hidden accept=".csv" />
  </div>
  <div v-else class="container route-assets-upload-template">
    <div class="route-assets__page-header-title">
      {{ t('adar.routeAssets.stages.uploadTemplate.parcingError.title') }}
    </div>
    <div class="route-assets__page-header-description">
      {{ t('adar.routeAssets.stages.uploadTemplate.parcingError.description') }}
    </div>
    <s-button type="primary" class="s-typography-button--big restart-button" @click.stop="onRestartClick">
      {{ t('adar.routeAssets.stages.uploadTemplate.parcingError.buttonTitle') }}
    </s-button>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import TranslationMixin from '@/components/mixins/TranslationMixin';
import { action } from '@/store/decorators';
@Component({
  components: {},
})
export default class UploadTemplate extends Mixins(TranslationMixin) {
  @action.routeAssets.updateRecipients private updateRecipients!: (file?: File) => Promise<void>;
  @action.routeAssets.processingNextStage nextStage!: () => void;
  @action.routeAssets.cancelProcessing private cancelProcessing!: () => void;
  dragOver = false;
  file: Nullable<File> = null;

  parsingError = false;

  dragover(event) {
    event.preventDefault();
    this.dragOver = true;
  }

  dragleave(event) {
    event.preventDefault();
    this.dragOver = false;
  }

  drop(event) {
    event.preventDefault();
    this.dragOver = false;
    const file = event.dataTransfer.files[0];
    const allowedExtensions = /(\.csv)$/i;
    if (!allowedExtensions.exec(file.name)) {
      this.parsingError = true;
      return;
    }
    (this as any).$refs.file.files = event.dataTransfer.files;
    this.uploadFile((this as any).$refs.file.files[0]);
  }

  onRestartClick() {
    this.cancelProcessing();
    this.parsingError = false;
    (this as any).$refs.file = null;
  }

  onInputChanged(event) {
    this.uploadFile(event.target.files[0]);
  }

  async uploadFile(file: File) {
    this.updateRecipients(file)
      .then(() => {
        this.nextStage();
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error);
        this.parsingError = true;
      });
  }
}
</script>

<style lang="scss">
.route-assets-upload-template {
  text-align: center;
  font-weight: 300;
  font-feature-settings: 'case' on;

  &__title {
    font-size: 24px;
  }

  &__description {
    font-size: 16px;
  }

  > *:not(:last-child) {
    margin-bottom: $inner-spacing-big;
  }

  &__button {
    width: 100%;
    padding: inherit 30px;
  }

  &__label {
    font-weight: 300;
    font-size: 13px;
    line-height: 140%;
    color: var(--s-color-brand-day);
  }
}
</style>

<style scoped lang="scss">
.dropping-area {
  border: 1px dashed var(--s-color-base-content-tertiary);
  border-radius: var(--s-border-radius-small);
  height: 255px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 28px 22px;

  &__description {
    font-weight: 400;
    font-size: 16px;
    line-height: 150%;
  }

  &.drag-over {
    filter: blur(2.2px) brightness(0.5);
    cursor: grab;
  }
}

.restart-button {
  width: 100%;
  margin-bottom: 16px;
  margin-left: 0;
  margin-right: 0;
}

.file-upload {
  width: 110px;
  input {
    overflow: hidden;
    width: 0;
  }
}
</style>
