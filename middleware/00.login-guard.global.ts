import { useAppStore } from '~/store/app';

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return;
  const localePath = useLocalePath();
  const appStore = useAppStore();
  const meta: Record<string, any> = { ...to.meta };
  if (import.meta.dev) {
    console.log('[login-route-guard] page meta=', meta);
  }
  if (meta.needLogin === true && !appStore.logined) {
    if (import.meta.dev) {
      console.log('[login-route-guard] need login!');
    }
    return navigateTo(localePath('/login'));
  }
  if (meta.needAdmin === true && appStore.userCache?.isStaff !== true) {
    if (import.meta.dev) {
      console.log('[login-route-guard] need admin!');
    }
    return navigateTo(localePath('/login'));
  }
});
