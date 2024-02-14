import {useAppStore} from "@/store/app";

export const reCAPTCHAKey = "6Lczc24pAAAAAAxzBZbRy8CZc_ba06Qn_3OJ_Vg-"
export const cloudflareCAPTCHAKey = "0x4AAAAAAARtCTyyGc1nbVUm"

export default function doFetchPost(url: string, data: any) {
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
