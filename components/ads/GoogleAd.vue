<script lang="ts" setup>
import { getGlobalThis } from '@vue/shared';
import { useAppStore } from '~/store/app';

const insFather = ref<Element>();
const ins = computed(() => {
  return insFather.value?.querySelector('ins') ?? undefined;
});

defineSlots<{
  default: () => any;
}>();
defineProps<{
  adSlot?: string;
  adFormat?: string;
}>();
declare global {
  interface Window {
    adsbygoogle: {
      push: (arg0: any) => void;
    };
  }
}
let interval: any = null;
const appStore = useAppStore();
if (appStore.gads) {
  onMounted(() => {
    let ok = false;
    console.log('onMounted', ins.value);
    interval = setInterval(() => {
      if (window.adsbygoogle && ins.value) {
        ok = true;
        clearInterval(interval);
        window.adsbygoogle?.push({});
        console.log('adsbygoogle.push()', ins.value);
      }
    }, 1000);
    if (!getGlobalThis().google_adtest) {
      setInterval(() => {
        document
          .querySelectorAll<HTMLElement>(
            '.adsbygoogle[data-ad-status="unfilled"]',
          )
          .forEach((ins) => {
            let element = ins;
            while (element.parentElement?.childElementCount === 1) {
              element = element.parentElement;
            }
            element.remove();
          });
      }, 1000);
    }
  });
  onUnmounted(() => {
    clearInterval(interval);
  });
  onUpdated(() => {
    try {
      window.adsbygoogle?.push({});
      console.log('onUpdated', ins.value);
    } catch (_) {}
  });
}
</script>

<template>
  <div ref="insFather">
    <slot>
      <ins
        :data-ad-format="adFormat ?? 'auto'"
        :data-ad-slot="adSlot"
        class="adsbygoogle"
        data-ad-client="ca-pub-4957320708232906"
        data-full-width-responsive="true"
      />
    </slot>
  </div>
</template>

<style scoped>
.adsbygoogle {
  display: block;
}
</style>
