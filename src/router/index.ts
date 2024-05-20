// Composables
import { createRouter, createWebHistory } from 'vue-router';
import { useTitle } from '@vueuse/core';

const title = useTitle();

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        meta: { title: 'reden.title.home' },
        component: () => import('@/views/Home.vue'),
      },
      {
        path: '/login',
        meta: { title: 'login.title' },
        component: () => import('@/views/Login.vue'),
      },
      {
        path: '/register',
        meta: { title: 'register.title' },
        component: () => import('@/views/Register.vue'),
      },
      {
        path: '/sponsors',
        meta: { title: 'sponsors.title' },
        component: () => import('@/views/Sponsors.vue'),
      },
      {
        path: '/home',
        meta: { title: 'reden.title.my_account' },
        component: () => import('@/views/profile/UserHome.vue'),
      },
      {
        path: '/home/edit',
        name: 'EditProfile',
        meta: { title: 'reden.title.edit_profile' },
        component: () => import('@/views/profile/EditProfile.vue'),
      },
      {
        path: '/download',
        name: 'Download',
        meta: { title: 'reden.title.download' },
        component: () => import('@/views/Download.vue'),
      },
      {
        path: '/feature',
        name: 'Feature',
        meta: { title: 'reden.title.feature' },
        component: () => import('@/views/Feature.vue'),
      },
      {
        path: '/feature/undo',
        name: 'Undo',
        meta: { title: 'reden.title.undo' },
        component: () => import('@/views/feature/Undo.vue'),
      },
      {
        path: '/feature/rvc',
        name: 'RVC',
        meta: { title: 'reden.title.rvc' },
        component: () => import('@/views/feature/RVC.vue'),
      },
      {
        path: '/feature/debugger',
        name: 'Debugger',
        meta: { title: 'reden.title.debugger' },
        component: () => import('@/views/feature/Debugger.vue'),
      },
      {
        path: '/user/:uid(\\d+)',
        name: 'UserProfileById',
        component: () => import('@/views/profile/OtherUser.vue'),
      },
      {
        path: '/@:username',
        name: 'UserProfileByName',
        component: () => import('@/views/profile/OtherUser.vue'),
      },
      {
        path: '/mc-services/download/yisibite',
        name: 'YisibiteDownload',
        meta: { title: '投影在线生成在线下载' },
        component: () => import('@/views/yisibite/Download.vue'),
      },
      {
        path: '/admin/users',
        name: 'AdminUserList',
        meta: { title: 'admin.title.users' },
        component: () => import('@/views/admin/UserList.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    return { top: 0 };
  },
});

export default router;
