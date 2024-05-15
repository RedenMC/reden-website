import { useAppStore } from '@/store/app';
import { ref, Ref } from 'vue';
import { toast } from 'vuetify-sonner';

export const reCAPTCHAKey = '6Lczc24pAAAAAAxzBZbRy8CZc_ba06Qn_3OJ_Vg-';
export const cloudflareCAPTCHAKey = '0x4AAAAAAARtCTyyGc1nbVUm';
export const discordInvite = 'https://discord.gg/fCxmEyFgAd';
export const githubLink = 'https://github.com/zly2006/reden-is-what-we-made';
export const theme = ref(useAppStore().theme);
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

export function doFetchPost(url: string, data: any) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': useAppStore().csrfToken || '[Reden] no csrf token',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
}

export function doFetchPut(url: string, data: any) {
  return fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': useAppStore().csrfToken || '[Reden] no csrf token',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
}

export function doFetchGet(url: string) {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': useAppStore().csrfToken || '<no csrf token>',
    },
    credentials: 'include',
  });
}

export function doFetchDelete(url: string) {
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': useAppStore().csrfToken || '<no csrf token>',
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
) {
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
    password.match(/[a-z]/) &&
    password.match(/[A-Z]/) &&
    password.match(/[0-9]/)
  );
}
