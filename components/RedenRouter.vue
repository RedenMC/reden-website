<script lang="ts" setup>
import { computed } from 'vue';
import type { RouteLocationRaw, RouterLinkProps } from '#vue-router';

interface NuxtLinkProps extends /* @vue-ignore */ Omit<RouterLinkProps, 'to'> {
  to?: RouteLocationRaw;
  href?: NuxtLinkProps['to'];
  external?: boolean;
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

const isExternalLink = computed(() => {
  let b = typeof props.to === 'string' && props.to.startsWith('http');
  console.log(props.to, 'is-external', b);
  return b;
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
    <v-icon v-if="!noExternalIcon" size="xs">mdi-open-in-new</v-icon>
  </a>
  <nuxt-link-locale
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
  </nuxt-link-locale>
</template>
