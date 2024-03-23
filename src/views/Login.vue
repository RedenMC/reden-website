<script setup lang="ts">
import VueTurnstile from 'vue-turnstile';
import {
  cloudflareCAPTCHAKey,
  doFetchPost,
  LoginResponse,
  toastError,
} from '@/constants';
import { useAppStore } from '@/store/app';
import { toast } from 'vuetify-sonner';
import { ref } from 'vue';
import router from '@/router';

const username = ref('');
const password = ref('');
const loading = ref(false);
const token = ref('');
function login() {
  loading.value = true;
  const req = {
    username: username.value,
    password: password.value,
    timestamp: new Date().getTime(),
    captcha: {
      token: token.value,
      provider: 'cloudflare',
    },
  };
  doFetchPost('/api/account/login', req)
    .then(async (response) => {
      if (!response.ok) {
        return Promise.reject(response);
      }
      let data: LoginResponse = await response.json();
      console.log(data);
      useAppStore().login(username.value, 1);
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
      <v-text-field
        v-model="username"
        label="Username"
        placeholder="Username"
        required
      >
        <template #prepend>
          <v-icon>mdi-account</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="password"
        label="Password"
        placeholder="Password"
        type="password"
        required
      >
        <template #prepend>
          <v-icon>mdi-lock</v-icon>
        </template>
      </v-text-field>
      <vue-turnstile
        :site-key="cloudflareCAPTCHAKey"
        v-model="token"
        v-show="!token"
      />
      <v-btn
        :loading="loading"
        :disabled="!token"
        color="primary"
        @click="login"
      >
        {{ token ? $t('login.button.login') : $t('login.button.captcha') }}
      </v-btn>

      <span class="text-center" style="padding: 4px">
        <a href="/forgot-password">Forgot Password?</a> or
        <a href="/register">Register</a>
      </span>

      <h1>
        {{ $t('login.oauth') }}
      </h1>

      <v-row>
        <v-col>
          <v-btn
            color="blue"
            :href="'/api/oauth/github?redirect_url=' + encodeURI('/home')"
            :block="true"
          >
            <v-icon left>mdi-github</v-icon>
            Github
          </v-btn>
        </v-col>
        <v-col>
          <v-btn
            color="red"
            :href="'/api/oauth/microsoft?redirect_url=' + encodeURI('/home')"
            :block="true"
          >
            <v-icon left>mdi-microsoft</v-icon>
            Microsoft
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn
            color="green"
            :href="'/api/oauth/gitee?redirect_url=' + encodeURI('/home')"
            :block="true"
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
