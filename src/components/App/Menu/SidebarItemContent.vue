<template>
  <component :is="tag" :class="classes" :tabindex="tabindex">
    <div v-if="icon === 'adar-about'" class="icon-container">
      <adar-about-icon class="sora-card-sidebar-icon" />
    </div>
    <div v-else-if="icon" class="icon-container">
      <s-icon :name="icon" size="28" :tooltip-text="title" />
    </div>
    <span>{{ title }}</span>
  </component>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import SideMenuAdarAbout from '@/assets/img/adar/sidebar.svg?inline';
import TranslationMixin from '@/components/mixins/TranslationMixin';
import AdarAboutIcon from '@/modules/ADAR/components/App/Menu/AdarAboutIcon.vue';

// import SoraCardIcon from './SoraCardIcon.vue';

@Component({
  components: {
    // SoraCardIcon,
    SideMenuAdarAbout,
    AdarAboutIcon,
  },
})
export default class AppSidebarItemContent extends Mixins(TranslationMixin) {
  @Prop({ default: '', type: String }) readonly icon!: string;
  @Prop({ default: '', type: String }) readonly title!: string;
  @Prop({ default: 'div', type: String }) readonly tag!: string;
  @Prop() readonly tabindex!: string | number;

  get classes(): Array<string> {
    const base = 'sidebar-item-content';
    const classes = [base];

    if (this.tag === 'a') {
      classes.push(`${base}--link`);
    }

    return classes;
  }
}
</script>

<style lang="scss" scoped>
$icon-size: 42px;

.sidebar-item-content {
  display: flex;
  align-items: center;

  &--link {
    &,
    &:hover,
    &:focus,
    &:visited {
      text-decoration: none;
      color: inherit;
    }
  }
}

.icon-container {
  display: flex;
  flex-shrink: 0;
  padding-left: 1px; // because of inset shadow
  width: $icon-size;
  height: $icon-size;
  border-radius: 50%;
  background-color: var(--s-color-utility-body);
  transition: var(--s-transition-default);
  > i {
    margin: auto;
    @include icon-styles(true);
  }
  & + span {
    margin-left: $inner-spacing-small;

    @include large-mobile {
      display: none;
    }

    @include tablet {
      display: block;
    }
  }
  .el-menu-item.is-active & {
    box-shadow: -1px -1px 1px var(--s-shadow-color-dark-light), 1px 1px 3px var(--s-shadow-color-dark),
      inset 1px 1px 2px var(--s-shadow-color-light-dark);
  }
  .menu-item--small & {
    margin-right: 0;
    background-color: transparent;
    box-shadow: none;
  }
}
.sora-card-sidebar-icon {
  display: block;
  margin: auto;
  background-repeat: no-repeat;
  background-position: center center;
}
.el-menu-item:not(.is-active):not(.is-disabled):focus .sora-card-sidebar-icon path {
  fill: var(--s-color-base-content-secondary) !important; // focus state of sora card item
}
</style>
