<script lang="ts" setup>
import {
  AllowedComponentProps,
  ComponentCustomProps,
  computed,
  VNodeProps,
} from 'vue';
import { RouterLink, RouterLinkProps } from 'vue-router';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<
  AllowedComponentProps &
    ComponentCustomProps &
    VNodeProps &
    RouterLinkProps & {
      noExternalIcon?: boolean;
      inactiveClass?: string;
    }
>();

const isExternalLink = computed(() => {
  return typeof props.to === 'string' && props.to.startsWith('http');
});
</script>

<template>
  <a
    v-if="isExternalLink"
    v-bind="$attrs"
    class="router-external router"
    :href="props.to as string"
    target="_blank"
  >
    <slot />
    <v-icon v-if="!noExternalIcon" size="small">mdi-open-in-new</v-icon>
  </a>
  <router-link
    v-else
    v-bind="$props"
    :to="props.to"
    custom
    class="router"
    v-slot="{ isActive, href, navigate }"
  >
    <a
      v-bind="$attrs"
      :href="href"
      @click="navigate"
      :class="[
        isActive ? props.activeClass : props.inactiveClass || 'router-inactive',
        'router',
      ]"
    >
      <slot />
    </a>
  </router-link>
</template>
