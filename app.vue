<template>
  <VitePwaManifest />
  <Link href="/reden_256.png" rel="apple-touch-icon" />
  <div>
    <NuxtRouteAnnouncer />
    <nuxt-layout>
      <nuxt-page />
    </nuxt-layout>
  </div>
</template>

<script lang="ts" setup>
import { getGlobalThis } from '@vue/shared';

onMounted(() => {
  if (
    import.meta.env.PROD &&
    document.referrer &&
    !document.referrer.includes('redenmc.com')
  ) {
    console.log('Referrer:', document.referrer);
    doFetchPost('/api/log/referrer', document.referrer || '');
  }
  (function googleAds() {
    const script = document.createElement('script');
    if (import.meta.dev) {
      getGlobalThis().google_adtest = 'on';
      script.dataset.adbreakTest = 'on';
    }
    script.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4957320708232906';
    script.crossOrigin = 'anonymous';
    script.async = true;
    document.head.appendChild(script);
  });
  function microsoftAnalytics() {
    const script = document.createElement('script');
    script.src = 'https://www.clarity.ms/tag/psoi8pwdek';
    script.async = true;
    document.head.appendChild(script);
    const window = getGlobalThis();
    window.clarity =
      window.clarity ||
      function () {
        (window.clarity.q = window.clarity.q || []).push(arguments);
      };
  }
  if (!import.meta.dev) {
    microsoftAnalytics();
  }
  (function monetag() {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://kulroakonsu.net/88/tag.min.js';
    script.dataset.zone = '129605';
    script.dataset.cfasync = 'false';
    //todo:
    // document.head.appendChild(script);
  })();
});
</script>

<!--suppress CssUnusedSymbol -->
<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
