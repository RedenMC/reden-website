<script setup lang="ts">
import {cloudflareCAPTCHAKey} from "@/constants";
</script>
<script lang="ts">

export function getCFToken(): string {
  const form = document.forms.namedItem("captcha")
  if (form == null) return ''
  return new FormData(form).get('cf-turnstile-response') || ''
}

export default {
  mounted() {
    let recaptchaScript = document.createElement('script')
    recaptchaScript.setAttribute('src', 'https://challenges.cloudflare.com/turnstile/v0/api.js')
    document.head.appendChild(recaptchaScript)
  }
}
</script>

<template>
  <form name="captcha" class="captcha">
    <div class="cf-turnstile" :data-sitekey="cloudflareCAPTCHAKey"></div>
  </form>
</template>

<style scoped>
.captcha {
  position: relative;
  top: 0;
  right: 0;
}
</style>
