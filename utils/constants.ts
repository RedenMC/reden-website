import { useAppStore } from '@/store/app';
import { type Ref } from 'vue';
import { toast } from 'vuetify-sonner';
import { useBackendMeta } from '@/store/meta';
import 'vue-turnstile';

const NuxtApp = useNuxtApp();

// private, for SSR

export const reCAPTCHAKey = '6Lczc24pAAAAAAxzBZbRy8CZc_ba06Qn_3OJ_Vg-';
export const cloudflareCAPTCHAKey = '0x4AAAAAAARtCTyyGc1nbVUm';
export const discordInvite = 'https://discord.gg/fCxmEyFgAd';
export const githubLink = 'https://github.com/zly2006/reden-is-what-we-made';
// export const theme = ref(useAppStore(pinia).theme);
export const usernameRegex =
  /^[a-zA-Z\-\u4e00-\u9fa5][\w\-\u4e00-\u9fa5]{3,19}$/;

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
};

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

export const doFetchPost = (url: string, data: any) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'Reden',
      'X-CSRF-Token':
        useAppStore(/*pinia*/).csrfToken || '[Reden] no csrf token',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  }).then((res) => {
    if (res.status === 401) {
      useAppStore(/*pinia*/).logout();
    }
    return res;
  });

function getPayloadType(data: any): {
  isJson: boolean;
  fetchBody: any;
} {
  if (data instanceof File || data instanceof FormData) {
    return { isJson: false, fetchBody: data };
  }
  if (data instanceof Object) {
    return { isJson: true, fetchBody: JSON.stringify(data) };
  }
  if (data instanceof String) {
    return { isJson: false, fetchBody: data };
  }
  throw new Error('Unknown type.');
}

export function doFetchPut(url: string, data: any) {
  const { fetchBody, isJson } = getPayloadType(data);
  const headers: { [key: string]: string } = {
    'X-Requested-With': 'Reden',
    'X-CSRF-Token': useAppStore(/*pinia*/).csrfToken || '[Reden] no csrf token',
  };
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(url, {
    method: 'PUT',
    credentials: 'include',
    headers,
    body: fetchBody,
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
      'X-CSRF-Token': useAppStore(/*pinia*/).csrfToken || '<no csrf token>',
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
    toast(message || 'Error', {
      description: e.message,
      duration: 3e3,
      cardProps: {
        color: 'error',
      },
    });
  } else if (e instanceof Response) {
    try {
      const data: ErrorResponse = await e.json();
      if (message) {
        toast(message, {
          description: `${e.status} ${data.error}`,
          duration: 3e3,
          cardProps: {
            color: 'error',
          },
        });
      } else {
        toast(`${e.status} ${data.error}`, {
          description: data.error_description || e.statusText,
          duration: 3e3,
          cardProps: {
            color: 'error',
          },
        });
      }
    } catch (_) {
      // not json
      toast(message || 'Error', {
        description: `Status: ${e.status} ${e.statusText}`,
        duration: 3e3,
        cardProps: {
          color: 'error',
        },
      });
    }
  } else if (e instanceof Object && e.error) {
    console.log('error', e);
    toast(message || 'Error', {
      description: e.error + (e.error_description || ''),
      duration: 3e3,
      cardProps: {
        color: 'error',
      },
    });
  } else {
    console.log('error', e);
    toast('Error', {
      description: message,
      duration: 3e3,
      cardProps: {
        color: 'error',
      },
    });
  }
}

export type ErrorResponse = {
  error: string;
  error_description: string;
};

export const fetchUser = (userRef: Ref<Profile | undefined>) =>
  doFetchGet('/api/account/profile')
    .then(async (response) => {
      if (response.ok) {
        const data: Profile = await response.json();
        userRef.value = data;
        useAppStore(/*pinia*/).updateCache(data);
      } else {
        if (response.status === 401) {
          toast('Error', {
            description: 'You are not logged in',
            duration: 3e3,
            cardProps: {
              color: 'error',
            },
          });
          window.location.href = '/login';
        }
        return Promise.reject(await response.json());
      }
    })
    .catch((e) => toastError(e, 'Failed to get user profile'));

export const fetchOtherUser = (
  lookup: number | string,
  ref: Ref<Profile | undefined>,
) =>
  doFetchGet(`/api/users/${lookup}`)
    .then(async (response) => {
      if (response.ok) {
        ref.value = await response.json();
      } else {
        return Promise.reject(response);
      }
    })
    .catch((e) => toastError(e, 'Failed to get user profile'));

export type OAuthAccount = {
  type: string;
  id: string;
  email: string;
  name?: string;
};

export function getOauth(
  type: string,
  url: string,
  account: Ref<OAuthAccount | undefined>,
): Promise<void | undefined> {
  return doFetchGet(url)
    .then((res) => {
      if (res.ok) {
        res.json().then((data: OAuthAccount) => {
          account.value = data;
        });
      } else if (res.status == 404) {
        account.value = undefined;
      } else {
        return Promise.reject(res);
      }
    })
    .catch((e) => toastError(e, `Failed to get ${type} account`));
}

export function isStrongPassword(password: string) {
  return !!(
    password.length >= 8 &&
    password.match(/[a-zA-Z]/) &&
    password.match(/[0-9]/)
  );
}

export const debugMessages = () => !useBackendMeta(/*pinia*/).get().production;

let _isInChina: boolean | undefined = undefined;
export function isInChina() {
  if (_isInChina) return Promise.resolve(_isInChina);
  if (!import.meta.client) return Promise.resolve(false);
  else {
    return doFetchGet('/api/ip')
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        return Promise.resolve({});
      })
      .then((data: { ip: string; mm?: { country_code?: string } }) => {
        if (data.mm?.country_code === 'CN') {
          console.log('ip', data.ip, 'is in china.');
          _isInChina = true;
          return true;
        }
        _isInChina = false;
        return false;
      });
  }
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
    translate: 'no-quark',
    hover_translate: 'user.no_quark_hover',
    icon: '',
    color: '#025669',
  },
};
