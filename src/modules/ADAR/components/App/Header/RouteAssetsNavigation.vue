<template>
  <div class="navbar">
    <div v-for="(num, idx) in totalStagesNumber" :key="idx" class="navbar-container">
      <div :class="isActive(num) ? 'active' : ''">
        <div class="circle">
          <div>{{ num }}</div>
        </div>
        <p v-if="isActive(num)">{{ stageTitle }}</p>
      </div>
      <div v-if="num !== totalStagesNumber" class="link"></div>
    </div>
  </div>
</template>

<script lang="ts">
import Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';
import { Component, Prop, Mixins } from 'vue-property-decorator';

import TranslationMixin from '@/components/mixins/TranslationMixin';
import AdarLogo from '@/components/shared/Logo/Adar.vue';
import { Stages } from '@/modules/ADAR/consts';
import { getter } from '@/store/decorators';

@Component({
  components: {
    AdarLogo,
  },
})
export default class RouteAssetsNavigation extends Mixins(TranslationMixin) {
  @getter.routeAssets.currentStageIndex private currentStageIndex!: number;
  @getter.routeAssets.currentStageComponentTitle currentStageComponentTitle!: string;

  @Prop({ default: Theme.LIGHT, type: String }) theme!: Theme;
  @Prop({ default: false, type: Boolean }) responsive!: boolean;

  isActive(num: number) {
    return num === this.currentStageIndex + 1;
  }

  get stageTitle() {
    return this.t(`adar.routeAssets.stagesNames.${this.currentStageComponentTitle}`);
  }

  get dark() {
    return this.theme === Theme.DARK;
  }

  get totalStagesNumber() {
    return Stages.length;
  }
}
</script>

<style lang="scss" scoped>
.circle {
  width: 24px;
  min-width: 24px;
  height: 24px;
  background: var(--s-color-utility-body);
  box-shadow: var(--s-shadow-element);
  border-radius: 32px;
  color: #a7a0a3;
  font-weight: 600;
  font-size: 8px;

  @include flex-center;
}

.navbar {
  min-width: 400px;
  @include flex-between;
}

.navbar-container {
  @include flex-between;
  width: 100%;
  font-size: 12px;
}

.active {
  background: var(--s-color-utility-body--dark);
  /* neo/drop */

  box-shadow: var(--s-shadow-element);
  border-radius: 32px;
  padding: 8px 10px;
  gap: 6px;
  color: white;
  @include flex-center;
  white-space: nowrap;
  text-transform: uppercase;
  font-weight: 600;

  .circle {
    background: var(--s-color-theme-accent);
    color: white;
    box-shadow: none;
  }
}

.link {
  height: 0px;
  width: 100%;
  min-width: 22px;

  border: 1px solid rgba(197, 197, 197, 0.5);
}
</style>
