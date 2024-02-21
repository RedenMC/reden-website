<script setup lang="ts">
import CloudFlareCaptcha from '@/components/CloudFlareCaptcha.vue';
</script>
<script lang="ts">
import {
  doFetchPost,
  ErrorResponse,
  LoginResponse,
  toastError,
} from '@/constants';
import { useAppStore } from '@/store/app';
import { toast } from 'vuetify-sonner';
import { getCFToken } from '@/components/CloudFlareCaptcha.vue';
import { useCaptchaStore } from '@/store/captcha';

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      captchaOk: false,
      task: 0,
    };
  },
  mounted() {
    this.task = setInterval(() => {
      const token = getCFToken();
      console.log(token);
      if (token !== '') {
        useCaptchaStore().set('cloudflare', token);
        this.captchaOk = true;
      }
    }, 1000);
  },
  unmounted() {
    clearInterval(this.task);
    turnstile.remove();
  },
  methods: {
    login() {
      this.loading = true;
      const req = {
        username: this.username,
        password: this.password,
        timestamp: new Date().getTime(),
        captcha: useCaptchaStore().$state,
      };
      doFetchPost('/api/account/login', req)
        .then(async (response) => {
          if (!response.ok) {
            return Promise.reject(response);
          }
          let data: LoginResponse = await response.json();
          console.log(data);
          useAppStore().login(this.username, 1);
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
              this.$router.push(data.redirect);
            } else {
              this.$router.push('/');
            }
          }, 500);
        })
        .catch((e) => {
          clearInterval(this.task);
          this.task = setInterval(() => {
            const token = getCFToken();
            console.log(token);
            if (token !== '') {
              useCaptchaStore().set('cloudflare', token);
              this.captchaOk = true;
            }
          }, 1000);
          turnstile.reset();
          toastError(e, 'Login Failed');
          this.captchaOk = false;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
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

      <CloudFlareCaptcha v-show="!captchaOk" />

      <v-btn
        :loading="loading"
        :disabled="!captchaOk"
        color="primary"
        @click="login"
      >
        {{ captchaOk ? $t('login.button.login') : $t('login.button.captcha') }}
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
</style>
