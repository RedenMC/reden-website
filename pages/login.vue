<script lang="ts" setup>
import {
  type Captcha,
  doFetchPost,
  type LoginResponse,
  resetCaptcha,
  toastError,
} from '@/utils/constants';
import { useAppStore } from '@/store/app';
import { toast } from 'vuetify-sonner';
import { ref } from 'vue';
import CommonCaptcha from '@/components/CommonCaptcha.vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import RedenRouter from '~/components/RedenRouter.vue';
import OAuthButtons from '~/components/misc/OAuthButtons.vue';

const { t } = useI18n();
const { mobile } = useDisplay({
  mobileBreakpoint: 500,
});
const localePath = useLocalePath();
const route = useRoute();
const router = useRouter();
const dev = import.meta.dev;

if (route.query?.csrf_token) {
  // oauth login csrf token is not passed by json, but by query string
  const csrf = route.query.csrf_token as string;
  useAppStore().setCsrfToken(csrf);
  router.replace('/home');
}

const username = ref('');
const password = ref('');
const loading = ref(false);
const captcha = ref<Captcha>();
useHead({
  title: t('login.title'),
  titleTemplate: '%s - Reden',
});
useSeoMeta({
  ogTitle: t('login.title'),
  description: 'Login your Reden account.',
});

function login() {
  loading.value = true;
  const req = {
    username: username.value,
    password: password.value,
    timestamp: new Date().getTime(),
    captcha: captcha.value,
  };
  doFetchPost('/api/account/login', req)
    .then(async (response) => {
      if (!response.ok) {
        resetCaptcha();
        captcha.value = undefined;
        return Promise.reject(response);
      }
      const data: LoginResponse = await response.json();
      useAppStore().login(username.value, -1);
      useAppStore().setCsrfToken(data.csrf_token);
      toast.success('Login Successful', {
        description: 'You have been logged in',
        duration: 1000,
      });
      setTimeout(() => {
        if (data.redirect !== undefined) {
          router.push(localePath('/home'));
        } else {
          router.push(localePath('/'));
        }
      }, 500);
    })
    .catch((e) => {
      toastError(e, 'Login Failed');
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<template>
  <div class="main-page">
    <div class="login-form">
      <h1>
        {{ t('login.title') }}
      </h1>
      <v-form>
        <v-text-field
          v-model="username"
          :label="t('login.username_or_email_or_phone')"
          autocomplete="username"
          required
        >
          <template v-if="!mobile" #prepend>
            <v-icon>mdi-account</v-icon>
          </template>
        </v-text-field>
        <v-text-field
          v-model="password"
          :label="t('profile.password')"
          autocomplete="current-password"
          required
          type="password"
        >
          <template v-if="!mobile" #prepend>
            <v-icon>mdi-lock</v-icon>
          </template>
        </v-text-field>
      </v-form>
      <common-captcha v-model="captcha" />
      <v-btn
        :disabled="!dev && !captcha?.token"
        :loading="loading"
        color="primary"
        @click="login"
      >
        {{
          dev
            ? 'Login (dev)'
            : captcha?.token
              ? t('login.button.login')
              : t('login.button.captcha')
        }}
      </v-btn>

      <span class="text-center" style="padding: 4px">
        <reden-router :to="localePath('/legal/privacy')">
          {{ t('common.privacy_policy') }}
        </reden-router>
        ·
        <reden-router :to="localePath('/forgot-password')">{{
          t('login.forgot_password')
        }}</reden-router>
        ·
        <reden-router :to="localePath('/register')">{{
          t('login.register')
        }}</reden-router>
      </span>

      <h2>
        {{ t('login.oauth') }}
      </h2>
      <o-auth-buttons />

      <v-row v-if="false">
        <v-col>
          <v-btn
            :block="true"
            :href="'/api/oauth/gitee?redirect_url=' + encodeURI('/login')"
            color="green"
          >
            <v-icon left>mdi-gitee</v-icon>
            Gitee
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;

  width: min(90%, 400px);
  left: 50%;

  padding-top: 80px;
  padding-bottom: 90px;
}

.main-page {
  display: flex;
  justify-content: center;
  align-content: center;
}
</style>
