<script lang="ts" setup>
import { computed } from 'vue';
import type { RouteLocationRaw, RouterLinkProps } from '#vue-router';

interface NuxtLinkProps extends /* @vue-ignore */ Omit<RouterLinkProps, 'to'> {
  to?: RouteLocationRaw;
  target?: '_blank' | '_parent' | '_self' | '_top' | (string & {}) | null;
  rel?:
    | 'noopener'
    | 'noreferrer'
    | 'nofollow'
    | 'sponsored'
    | 'ugc'
    | (string & {})
    | null;
  noRel?: boolean;
  prefetchedClass?: string;
  prefetch?: boolean;
  prefetchOn?:
    | 'visibility'
    | 'interaction'
    | Partial<{
        visibility: boolean;
        interaction: boolean;
      }>;
  noPrefetch?: boolean;
}

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<
  NuxtLinkProps & {
    noExternalIcon?: boolean;
    inactiveClass?: string;
  }
>();

const isExternalLink = computed(
  () =>
    typeof props.to === 'string' &&
    (props.to.startsWith('http') || props.to.startsWith('//')),
);
</script>

<template>
  <a
    v-if="isExternalLink"
    :href="props.to as string"
    class="router-external router"
    target="_blank"
    v-bind="$attrs"
  >
    <slot />
    <v-icon v-if="!noExternalIcon" size="xs">mdi-open-in-new</v-icon>
  </a>
  <nuxt-link-locale
    v-else
    v-slot="{ isActive, href, navigate }"
    :to="props.to"
    class="router"
    custom
    v-bind="$props"
  >
    <a
      :class="[
        isActive ? props.activeClass : props.inactiveClass || 'router-inactive',
        'router',
      ]"
      :href="href"
      v-bind="$attrs"
      @click="navigate"
    >
      <slot />
    </a>
  </nuxt-link-locale>
</template>
