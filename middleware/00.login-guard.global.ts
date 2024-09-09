import { useAppStore } from '~/store/app';

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return;
  const localePath = useLocalePath();
  const appStore = useAppStore();
  if (import.meta.dev) {
    const meta: Record<string, any> = {};
    for (const key of Object.keys(to.meta)) {
      meta[key] = to.meta[key];
    }
    console.log('[login-route-guard]', meta);
  }
  if (to.meta.needLogin === true && !appStore.logined) {
    if (import.meta.dev) {
      console.log('[login-route-guard] need login!');
    }
    return navigateTo(localePath('/login'));
  }
  if (to.meta.needAdmin === true && appStore.userCache?.isStaff !== true) {
    if (import.meta.dev) {
      console.log('[login-route-guard] need admin!');
    }
    return navigateTo(localePath('/login'));
  }
});
