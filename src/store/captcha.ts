import { defineStore } from 'pinia'

export const useCaptchaStore = defineStore('captcha', {
  state: () => ({
    provider: 'cloudflare' as 'cloudflare' | 'reCAPTCHA' | 'none',
    token: null as string | null,
  }),
  actions: {
    set(provider: "cloudflare" | "reCAPTCHA" | "none", token: string) {
      this.provider = provider
      this.token = token
    },
    clear() {
      this.provider = 'none'
      this.token = null
    }
  },
})
