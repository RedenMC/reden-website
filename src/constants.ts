import {useAppStore} from "@/store/app";
import {Ref} from "vue";
import {toast} from "vuetify-sonner";

export const reCAPTCHAKey = "6Lczc24pAAAAAAxzBZbRy8CZc_ba06Qn_3OJ_Vg-"
export const cloudflareCAPTCHAKey = "0x4AAAAAAARtCTyyGc1nbVUm"
export const discordInvite = "https://discord.gg/fCxmEyFgAd"

export type Profile = {
  username: string
  email: string
  id: number
  avatarUrl: string
  roles: string[]
  mcUUID: string
  isStaff: boolean
  githubId: string
}

export type GeneralResponse = {
  redirect?: string
  error?: string
  error_description?: string
}

export type LoginResponse = GeneralResponse & {
  csrf_token: string
}

export function doFetchPost(url: string, data: any) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': useAppStore().csrfToken || '[Reden] no csrf token'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })
}

export function doFetchGet(url: string) {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': useAppStore().csrfToken || '<no csrf token>'
    },
    credentials: 'include',
  })
}

export type ErrorResponse = {
  error: string
  error_description: string
}

export function fetchUser(userRef: Ref<Profile | undefined>) {
  doFetchGet('/api/account/profile').then(async response => {
    if (response.ok) {
      const data: Profile = await response.json()
      userRef.value = data
      useAppStore().updateCache(data)
    } else {
      if (response.status === 401) {
        toast('Error', {
          description: 'You are not logged in',
          duration: 10000,
          cardProps: {
            color: 'error'
          }
        })
        window.location.href = '/login'
      }
      await Promise.reject(await response.json())
    }
  }).catch((e) => {
    toast('Error', {
      description: 'Failed to get user profile',
      duration: 10000,
      cardProps: {
        color: 'error'
      }
    })
    console.log(e)
  })
}

