import { useNuxtApp } from '#app';

export default defineNuxtRouteMiddleware((to, from) => {
  const { t } = useNuxtApp().$i18n;
  if (to.meta.title && typeof to.meta.title === 'string') {
    if (import.meta.dev) {
      console.log('title is', to.meta.title);
    }
    const title = t(to.meta.title as string) + ' - Reden';
    useHead({
      title,
    });
  }
});
