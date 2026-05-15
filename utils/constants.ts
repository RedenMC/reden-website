// noinspection JSUnusedGlobalSymbols

import { useAppStore } from '@/store/app';
import { type Ref } from 'vue';
import { toast } from 'vuetify-sonner';
import { useBackendMeta } from '@/store/meta';
import 'vue-turnstile';

if (import.meta.client) {
  console.log(
    '%c[Reden] Welcome to Reden',
    `background: linear-gradient(135deg, #ff0000, #ff7f00, #00ff00, #0000ff, #4b0082, #8b00ff);
     color: #fff;
     font-size: 1.5em;
     font-weight: bold;
     padding: 5px;
     border-radius: 5px;
     text-shadow: 1px 1px 2px #000;
    `,
  );
  console.log(
    'This website is open sourced under AGPL-3.0 License, feel free to use it in your projects. ' +
      'https://github.com/RedenMC/reden-website',
  );
}

export const reCAPTCHAKey = '6Lczc24pAAAAAAxzBZbRy8CZc_ba06Qn_3OJ_Vg-';
export const cloudflareCAPTCHAKey = '0x4AAAAAAARtCTyyGc1nbVUm';
export const discordInvite = 'https://discord.gg/fCxmEyFgAd';
export const githubLink = 'https://github.com/zly2006/reden-is-what-we-made';
export const usernameRegex =
  /^[a-zA-Z\-\u4e00-\u9fa5][\w\-\u4e00-\u9fa5]{3,19}$/;
export const zh_cn = 'zh_cn';

export type Profile = {
  id: number;
  username: string;
  password?: string | null;
  email: string;
  bio?: string;
  avatarUrl: string;
  roles: string[];
  qq?: number;
  mcUUID?: string;
  isStaff?: boolean;
  githubId?: string | null;
  passwordNotSet: boolean;
  lastLoginTime?: number;
  lastLoginIp?: string;
  bannedUntil?: number;
  canChangeNameUntil?: number;
  bannedReason?: string;
  preference: Preference;
  mmRecord?: {
    city?: string;
    city_zh?: string;
    subdivision?: string;
    subdivision_zh?: string;
    country?: string;
    country_zh?: string;
  };
  followers?: number;
  following?: number;
  followingProjects?: number;
  followedByMe?: boolean;
  // 中国大陆实名认证信息
  realName?: string;
  earningPlan?: string;
};

enum EarningPlan {
  None = 'None',
  PendingReview = 'PendingReview', // 管理员审核
  PendingRealNameIdentity = 'PendingRealNameIdentity', // 实名认证
  Ok = 'Ok', // 通过
  Rejected = 'Rejected', // 拒绝
  Disabled = 'Disabled', // 禁用
}

export function isEarningPlanOk(plan?: EarningPlan | string): boolean {
  return (
    plan === EarningPlan.Ok || plan === EarningPlan.PendingRealNameIdentity
  );
}

export type Preference = {
  showEmail: boolean;
  showQQ: boolean;
  showMC: boolean;
  showGithub: boolean;
  timezone?: string;
  showTimezone: boolean;
  pronouns?: string;
};

export type GeneralResponse = {
  redirect?: string;
  error?: string;
  error_description?: string;
};

export type LoginResponse = GeneralResponse & {
  csrf_token: string;
};

export const doFetchPost = async (url: string, data: any) => {
  const { body, isJson } = getPayloadType(data);
  const headers: { [key: string]: string } = {
    'X-Requested-With': 'Reden',
    'X-CSRF-Token': useAppStore().csrfToken || '[Reden] no csrf token',
  };
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  let res = await fetch(url, {
    method: 'POST',
    headers,
    credentials: 'include',
    body,
  });
  if (res.status === 401) {
    useAppStore().logout();
  }
  return res;
};

function getPayloadType(data: any): {
  isJson: boolean;
  body: any;
} {
  if (data instanceof Blob || data instanceof FormData) {
    return { isJson: false, body: data };
  }
  if (data instanceof Object) {
    return { isJson: true, body: JSON.stringify(data) };
  }
  if (data instanceof String || typeof data === 'string') {
    return { isJson: false, body: data };
  }
  throw new Error('Unknown type.');
}

export function doFetchPut(
  url: string,
  data: any,
  _headers: Record<string, string> = {},
) {
  const { body, isJson } = getPayloadType(data);
  const headers: { [key: string]: string } = {
    'X-Requested-With': 'Reden',
    'X-CSRF-Token': useAppStore().csrfToken || '[Reden] no csrf token',
    ..._headers,
  };
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(url, {
    method: 'PUT',
    credentials: 'include',
    headers,
    body,
  });
}

export function doFetchGet(
  url: string,
  queries: { [key: string]: string } = {},
) {
  let queryString = '';

  for (const [key, value] of Object.entries(queries)) {
    if (queryString.length > 0) {
      queryString += '&';
    }
    queryString += `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }

  if (queryString) {
    url += (url.includes('?') ? '&' : '?') + queryString;
  }
  return fetch(url, {
    method: 'GET',
    headers: {
      'X-Requested-With': 'Reden',
      'X-CSRF-Token': useAppStore().csrfToken || '<no csrf token>',
    },
    credentials: 'include',
  });
}

export function doFetchDelete(url: string) {
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'X-Requested-With': 'Reden',
      'X-CSRF-Token': useAppStore(/*pinia*/).csrfToken || '<no csrf token>',
    },
    credentials: 'include',
  });
}

export async function toastError(
  e: Error | Response | ErrorResponse | any,
  message?: string,
) {
  if (e instanceof Error) {
    console.log('error', e);
    toast.error(message || 'Error', {
      description: e.message,
      duration: 5e3,
    });
  } else if (e instanceof Response) {
    try {
      const data: ErrorResponse = await e.json();
      if (message) {
        toast.error(message, {
          description: `${e.status} ${data.error}`,
          duration: 5e3,
        });
      } else {
        toast.error(`${e.status} ${data.error}`, {
          description: data.error_description || e.statusText,
          duration: 5e3,
        });
      }
    } catch (_) {
      // not json
      toast.error(message || 'Error', {
        description: `Status: ${e.status} ${e.statusText}`,
        duration: 5e3,
      });
    }
  } else if (e instanceof Object && e.error) {
    console.log('error', e);
    toast.error(message || 'Error', {
      description: e.error + (e.error_description || ''),
      duration: 5e3,
    });
  } else {
    console.log('error', e);
    toast.error('Error', {
      description: message,
      duration: 5e3,
    });
  }
}

export type ErrorResponse = {
  error: string;
  error_description: string;
};

export async function fetchUser(userRef: Ref<Profile | undefined>) {
  useNuxtApp();
  try {
    let response = await doFetchGet('/api/account/profile');
    if (response.ok) {
      const data: Profile = await response.json();
      userRef.value = data;
      useAppStore().updateCache(data);
    } else {
      if (response.status === 401) {
        toast('Error', {
          description: 'You are not logged in',
          duration: 3e3,
          cardProps: {
            color: 'error',
          },
        });
        useAppStore().logout();
        const localeRoute = useLocaleRoute();
        await useRouter().push(
          localeRoute({
            path: '/login',
            hash: '#status=401',
          })!,
        );
        console.log(
          '%c[Reden] User is not logged in',
          'color: #f00; font-weight: bold; font-size: 1.2em;background-color: #000',
        );
      }
      return Promise.reject(await response.json());
    }
  } catch (e) {
    return await toastError(e, 'Failed to get user profile');
  }
}

export type OAuthAccount = {
  type: string;
  id: string;
  email: string;
  name?: string;
};

export function isStrongPassword(password: string) {
  return !!(
    password.length >= 8 &&
    password.match(/[a-zA-Z]/) &&
    password.match(/[0-9]/)
  );
}

export const debugMessages = () => !useBackendMeta().get().production;
export function number2text(num?: number) {
  num = num || 0;
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

export function timeSince(time: number) {
  const { locale } = useI18n();
  if (locale.value === 'zh_cn') {
    let diff = (Date.now() - time) / 1e3;
    if (diff < 60) return '刚刚';
    diff /= 60;
    if (diff < 60) return Math.floor(diff) + '分钟前';
    diff /= 60;
    if (diff < 24) return Math.floor(diff) + '小时前';
    diff /= 24;
    if (diff < 30) return Math.floor(diff) + '天前';
    diff /= 30;
    if (diff < 12) return Math.floor(diff) + '月前';
    diff /= 12;
    return Math.floor(diff) + '年前';
  } else {
    let diff = (Date.now() - time) / 1e3;
    if (diff < 60) return 'just now';
    diff /= 60;
    if (diff < 60) return Math.floor(diff) + 'm ago';
    diff /= 60;
    if (diff < 24) return Math.floor(diff) + 'h ago';
    diff /= 24;
    if (diff < 30) return Math.floor(diff) + 'd ago';
    diff /= 30;
    if (diff < 12) return Math.floor(diff) + 'mon ago';
    diff /= 12;
    return Math.floor(diff) + 'yr ago';
  }
}

export function parseBVID(link?: string) {
  if (link) {
    const match = link.match(/bilibili.com\/video\/(BV[^/?]+)/);
    if (match) {
      return match[1];
    }
  }
  return null;
}

export type Captcha = {
  provider: string;
  token: string;
  server: string | null;
};

export type VaptchaObj = {
  getServerToken: () => {
    server: string;
    token: string;
  };
  listen: (event: 'pass' | 'close', fun: () => void) => void;
  render: () => void;
  reset: () => void;
};

declare global {
  interface Window {
    vaptcha: (config: any) => Promise<VaptchaObj>;
    vaptchaObj: VaptchaObj;
  }
}

export function resetCaptcha() {
  if (window.turnstile) window.turnstile.reset();
  if (window.vaptchaObj) window.vaptchaObj.reset();
}

export type BadgeDef = {
  color: string;
  translate: string;
  hover_translate?: string;
  icon: string;
  url?: string;
};

export const badgeDefs: { [keys: string]: BadgeDef } = {
  developer: {
    color: 'green',
    translate: 'user.developer',
    hover_translate: 'user.developer_hover',
    icon: 'mdi-code-tags',
  },
  contributor: {
    color: 'orange',
    translate: 'user.contributor',
    hover_translate: 'user.contributor_hover',
    icon: 'mdi-account-star',
  },
  staff: {
    color: 'blue',
    translate: 'user.staff',
    hover_translate: 'user.staff_hover',
    icon: 'mdi-account-tie',
  },
  sponsor: {
    color: 'purple',
    translate: 'user.sponsor',
    hover_translate: 'user.sponsor_hover',
    icon: 'mdi-account-heart',
    url: '/sponsors',
  },
  'no-quark': {
    color: 'cyan',
    translate: '',
    hover_translate: '已禁用夸克网盘',
    icon: 'custom:QuarkCloud',
  },
  archiver: {
    color: 'blue-grey',
    translate: 'user.archiver',
    hover_translate: 'user.archiver_hover',
    icon: 'mdi-archive',
  },
};

export function getMinecraftVersionPrefix(version: string) {
  if (version.startsWith('1.')) {
    return version.split('.').length <= 2
      ? version
      : version.substring(0, version.lastIndexOf('.'));
  }
  return version.includes('.') ? version.substring(0, version.indexOf('.')) : version;
}

export function groupMinecraftVersions(versions: string[]) {
  const grouped: Record<string, string[]> = {};
  for (const version of versions) {
    const prefix = getMinecraftVersionPrefix(version);
    if (!grouped[prefix]) {
      grouped[prefix] = [];
    }
    grouped[prefix].push(version);
  }
  return grouped;
}

export function compareMinecraftVersions(a: string, b: string): number {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  const len = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) {
    const aVal = aParts[i] ?? 0;
    const bVal = bParts[i] ?? 0;
    if (aVal !== bVal) return bVal - aVal;
  }
  return 0;
}

export function size2text(val: number) {
  const kb = val / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;
  if (gb > 1) {
    return gb.toFixed(2) + ' GB';
  } else if (mb > 1) {
    return mb.toFixed(2) + ' MB';
  } else {
    return kb.toFixed(2) + ' KB';
  }
}

export const globalTheme = ref<'light' | 'dark'>('dark');

export enum PostType {
  LitematicaGen = 'LitematicaGen',
  LitematicaShare = 'LitematicaShare',
}

export enum PostStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Deleted = 'Deleted',
  TakenDown = 'TakenDown',
}

export const allPostTypes = [
  PostStatus.Pending,
  PostStatus.Approved,
  PostStatus.Rejected,
  PostStatus.Deleted,
  PostStatus.TakenDown,
];
