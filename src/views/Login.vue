<script lang="ts" setup>
import {
  Captcha,
  doFetchPost,
  LoginResponse,
  resetCaptcha,
  toastError,
} from '@/constants';
import { useAppStore } from '@/store/app';
import { toast } from 'vuetify-sonner';
import { ref } from 'vue';
import router from '@/router';
import RedenRouter from '@/router/RedenRouter.vue';
import CommonCaptcha from '@/components/CommonCaptcha.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const username = ref('');
const password = ref('');
const loading = ref(false);
const captcha = ref<Captcha>();

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
        return Promise.reject(response);
      }
      const data: LoginResponse = await response.json();
      useAppStore().login(username.value, -1);
      useAppStore().setCsrfToken(data.csrf_token);
      toast('Login Successful', {
        description: 'You have been logged in',
        duration: 1000,
        cardProps: {
          color: 'green',
        },
      });
      setTimeout(() => {
        if (data.redirect !== undefined) {
          router.push(data.redirect);
        } else {
          router.push('/');
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
        {{ $t('login.title') }}
      </h1>
      <v-form>
        <v-text-field
          v-model="username"
          :label="t('profile.username')"
          required
          autocomplete="username"
        >
          <template #prepend>
            <v-icon>mdi-account</v-icon>
          </template>
        </v-text-field>
        <v-text-field
          v-model="password"
          :label="t('profile.password')"
          required
          type="password"
          autocomplete="current-password"
        >
          <template #prepend>
            <v-icon>mdi-lock</v-icon>
          </template>
        </v-text-field>
      </v-form>
      <common-captcha force-cn v-model="captcha" />
      <v-btn
        :disabled="!captcha?.token"
        :loading="loading"
        color="primary"
        @click="login"
      >
        {{
          captcha?.token ? $t('login.button.login') : $t('login.button.captcha')
        }}
      </v-btn>

      <span class="text-center" style="padding: 4px">
        <reden-router to="/forgot-password">{{
          $t('login.forgot_password')
        }}</reden-router>
        {{ $t('login.or') }}
        <reden-router to="/register">{{ $t('login.register') }}</reden-router>
      </span>

      <h1>
        {{ $t('login.oauth') }}
      </h1>

      <v-row>
        <v-col>
          <v-btn
            :block="true"
            :href="'/api/oauth/github?redirect_url=' + encodeURI('/home')"
            color="blue"
          >
            <v-icon left>mdi-github</v-icon>
            Github
          </v-btn>
        </v-col>
        <v-col>
          <v-btn
            :block="true"
            :href="'/api/oauth/microsoft?redirect_url=' + encodeURI('/home')"
            color="red"
          >
            <v-icon left>mdi-microsoft</v-icon>
            Microsoft
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn
            :block="true"
            :href="'/api/oauth/gitee?redirect_url=' + encodeURI('/home')"
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

  width: 400px;
  left: 50%;

  padding-top: 80px;
  padding-bottom: 90px;
}

.main-page {
  display: flex;
  justify-content: center;
  align-content: center;
}

.captcha {
  margin: auto;
  margin-bottom: 15px;
}
</style>
