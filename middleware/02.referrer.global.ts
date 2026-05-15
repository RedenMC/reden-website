export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server || !from.path) return;
  sessionStorage.setItem("reden:referrer", from.fullPath);
});
