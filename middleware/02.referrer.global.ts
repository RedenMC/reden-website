const L = /^\/(zh_cn\/|zh_tw\/)?/;

const WHITELIST: RegExp[] = [
  new RegExp(L.source + /litematica(\?.*)?$/.source), // 列表页
  new RegExp(L.source + /litematica\/(review|edit|earning|earning-dashboard)(\?.*)?$/.source), // 审核/投稿/收益
  new RegExp(L.source + /@[\w-]+$/.source), // 作者主页
  new RegExp(L.source + /tag\/[\w-]+$/.source), // 标签页
  new RegExp(L.source + /tags(\/search)?$/.source), // 标签总览/搜索
  new RegExp(L.source + /admin/.source), // 后台管理
  new RegExp(L.source + /home(\/notifications)?$/.source), // 个人主页/通知
];

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server || !from.path) return;
  if (WHITELIST.some((p) => p.test(from.path))) {
    sessionStorage.setItem("reden:referrer", from.fullPath);
  } else {
    sessionStorage.removeItem("reden:referrer");
  }
});
