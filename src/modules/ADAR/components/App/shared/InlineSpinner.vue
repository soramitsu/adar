<template>
  <i class="c-inline-spinner"></i>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class InlineSpinner extends Vue {}
</script>

<style scoped lang="scss">
@keyframes c-inline-spinner-kf {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.c-inline-spinner,
.c-inline-spinner:before {
  display: inline-block;
  width: 11px;
  height: 11px;
  transform-origin: 50%;
  border: 2px solid transparent;
  border-color: var(--s-color-theme-accent) var(--s-color-theme-accent) transparent transparent;
  border-radius: 50%;
  content: '';
  animation: linear c-inline-spinner-kf 900ms infinite;
  position: relative;
  vertical-align: inherit;
  line-height: inherit;
}
.c-inline-spinner {
  top: 3px;
  margin: 0 3px;
}
.c-inline-spinner:before {
  border-color: var(--s-color-theme-accent) var(--s-color-theme-accent) transparent transparent;
  position: absolute;
  left: -2px;
  top: -2px;
  border-style: solid;
}
</style>
