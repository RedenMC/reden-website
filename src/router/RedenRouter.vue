<script lang="ts" setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  // @ts-ignore
  ...RouterLink.props,
  inactiveClass: String,
});

const isExternalLink = computed(() => {
  return typeof props.to === 'string' && props.to.startsWith('http');
});
</script>

<template>
  <a
    v-if="isExternalLink"
    v-bind="$attrs"
    class="router-external"
    :href="props.to"
    target="_blank"
  >
    <slot />
    <v-icon size="small">mdi-open-in-new</v-icon>
  </a>
  <router-link
    v-else
    v-bind="$props"
    :to="props.to"
    custom
    v-slot="{ isActive, href, navigate }"
  >
    <a
      v-bind="$attrs"
      :href="href"
      @click="navigate"
      :class="
        isActive ? props.activeClass : props.inactiveClass || 'router-inactive'
      "
    >
      <slot />
    </a>
  </router-link>
</template>
