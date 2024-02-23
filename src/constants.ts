import { useAppStore } from '@/store/app';
import { Ref } from 'vue';
import { toast } from 'vuetify-sonner';

export const reCAPTCHAKey = '6Lczc24pAAAAAAxzBZbRy8CZc_ba06Qn_3OJ_Vg-';
export const cloudflareCAPTCHAKey = '0x4AAAAAAARtCTyyGc1nbVUm';
export const discordInvite = 'https://discord.gg/fCxmEyFgAd';

export type Profile = {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatarUrl: string;
  roles: string[];
  qq?: number;
  mcUUID?: string;
  isStaff?: boolean;
  githubId?: string;
  timezone?: string;
  passwordNotSet: boolean;
  bannedUntil?: number;
  canChangeNameUntil?: number;
  bannedReason?: string;
  preference: Preference;
};

export type Preference = {
  showEmail: boolean;
  showQQ: boolean;
  showMC: boolean;
  showGithub: boolean;
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

export async function toastError(e: any, message?: string) {
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

export function fetchUser(userRef: Ref<Profile | undefined>) {
  return doFetchGet('/api/account/profile')
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
}

export function fetchOtherUser(uid: number, ref: Ref<Profile | undefined>) {
  doFetchGet(`/api/users/${uid}`)
    .then(async (response) => {
      if (response.ok) {
        ref.value = await response.json();
      } else {
        return Promise.reject(response);
      }
    })
    .catch((e) => toastError(e, 'Failed to get user profile'));
}

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
