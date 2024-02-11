<script setup lang="ts">
import {VSonner} from "vuetify-sonner";
import CloudFlareCaptcha from "@/components/CloudFlareCaptcha.vue";
</script>
<script lang="ts">
import doFetchPost from "@/constants";
import {useAppStore} from "@/store/app";
import {toast} from "vuetify-sonner";
import {getCFToken} from "@/components/CloudFlareCaptcha.vue";
import {useCaptchaStore} from "@/store/captcha";

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      captchaOk: false
    }
  },
  mounted() {
    setInterval(() => {
      const token = getCFToken()
      console.log(token)
      if (token !== '') {
        useCaptchaStore().set("cloudflare", token)
        this.captchaOk = true
      }
    }, 1000)
  },
  methods: {
    login() {
      this.loading = true
      const req = {
        username: this.username,
        password: this.password,
        timestamp: new Date().getTime(),
        captcha: useCaptchaStore().$state
      }
      doFetchPost('/api/account/login', req).then(async response => {
        if (response.ok) {
          let data: {
            redirect?: string
            csrf_token: string
          } = await response.json()
          console.log(data)
          useAppStore().login(this.username, 1)
          useAppStore().setCsrfToken(data.csrf_token)
          toast('Login Successful',
            {
              description: 'You have been logged in',
              duration: 1000,
              cardProps: {
                color: 'green'
              }
            }
          )
          setTimeout(() => {
            if (data.redirect !== undefined) {
              this.$router.push(data.redirect)
            } else {
              this.$router.push('/')
            }
          }, 500)
        } else {
          console.log(response)
          let data: {
            error: string
            error_description: string
          } = await response.json()
          toast('Login Failed',
            {
              description: data.error + '\n' + (data.error_description || ''),
              duration: 10000,
              cardProps: {
                color: 'red'
              }
            }
          )
          console.error('Login Failed', data)
        }
      }).finally(() => {
        this.loading = false
      })
    }
  },
}
</script>

<template>
  <VSonner position="top-center" :expand="true"/>

  <div class="main-page">
    <div class="login-form">
      <h1>
        Login to Reden
      </h1>
      <v-text-field
        v-model="username"
        label="Username"
        placeholder="Username"
        required>
        <template #prepend>
          <v-icon>mdi-account</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="password"
        label="Password"
        placeholder="Password"
        type="password"
        required>
        <template #prepend>
          <v-icon>mdi-lock</v-icon>
        </template>
      </v-text-field>
      <v-btn
        :loading="loading"
        :disabled="!captchaOk"
        color="primary"
        @click="login"
      >
        {{
          captchaOk ?
              'Login' :
              'Please complete the captcha'
        }}
      </v-btn>

      <span class="text-center" style="padding: 4px">
        <a href="/forgot-password">Forgot Password?</a> or <a href="/register">Register</a>
      </span>

      <h1>Or sign in with</h1>

      <v-row>
        <v-col>
          <v-btn
            color="blue"
            href="/oauth/github"
            :block="true"
          >
            <v-icon left>mdi-github</v-icon>
            Github
          </v-btn>
        </v-col>
        <v-col>
          <v-btn
            color="red"
            href="/oauth/microsoft"
            :block="true"
          >
            <v-icon left>mdi-microsoft</v-icon>
            Microsoft
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <CloudFlareCaptcha v-show="!captchaOk"/>
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
