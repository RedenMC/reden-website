<script setup lang="ts">
import {toast, VSonner} from "vuetify-sonner";
import CloudFlareCaptcha, {getCFToken} from "@/components/CloudFlareCaptcha.vue";
import {onMounted, onUnmounted, ref} from "vue";
import {useCaptchaStore} from "@/store/captcha";
import doFetchPost from "@/constants";
import { useI18n } from 'vue-i18n'

const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const invitationCode = ref('')
const loading = ref(false)
const captchaOk = ref(false)
const registerOk = ref(false)
let task : NodeJS.Timeout
const {t} = useI18n()

onMounted(() => {
  task = setInterval(() => {
    const token = getCFToken()
    console.log(token)
    if (token !== '') {
      useCaptchaStore().set("cloudflare", token)
      captchaOk.value = true
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(task)
  turnstile.remove()
})


function register() {
  if (!isStrongPassword()) return
  if (confirmPassword.value != password.value) return
  if (email.value.indexOf('@') == -1) return
  loading.value = true
  const req = {
    email: email.value,
    username: username.value,
    password: password.value,
    invitationCode: invitationCode.value,
    timestamp: new Date().getTime(),
    captcha: useCaptchaStore().$state
  }
  doFetchPost("/api/account/register/start", req).then(async res => {
    if (res.ok) {
      toast(t("register.toast.succ.title"),
        {
          description: t("register.toast.succ.msg"),
          duration: 1000,
          cardProps: {
            color: 'green'
          }
        })
      registerOk.value = true
    } else {
      await Promise.reject({
        code: res.status,
        data: await res.json()
      })
    }
  }).catch(e => {
    console.error('error',e)
    toast('Failed to register: ' + (e?.code || 'Unknown error'), {
      description: e?.data?.error || t("register.toast.try"),
      duration: 5000,
      cardProps: {
        color: 'error'
      }
    })
    captchaOk.value = false
    turnstile.reset()
  }).finally(() => {
    loading.value = false
  })
}

function isStrongPassword() {
  return password.value.length >= 8
    && password.value.match(/[a-z]/)
    && password.value.match(/[A-Z]/)
    && password.value.match(/[0-9]/)
}

function tmp(){
  toast(t("register.toast.succ.title"),
        {
          description: t("register.toast.succ.msg"),
          duration: 1000,
          cardProps: {
            color: 'green'
          }
        })
}
</script>

<template>
  <VSonner position="top-center" :expand="true"/>

  <div class="main-page">
    <div class="register-form" v-if="!registerOk">
      <h1>
        {{ $t('register.title') }}
      </h1>
      <v-text-field
        v-model="email"
        label="Email"
        placeholder="{{ t('register.placeholder.email') }}"
        required>
        <template #prepend>
          <v-icon>mdi-email</v-icon>
        </template>
      </v-text-field>
      <span v-if="email.indexOf('@') == -1" style="margin-top: -20px;margin-bottom: 5px;">
        <v-icon color="red" size="small">mdi-alert-circle</v-icon>
        {{ $t("register.inval.email") }}
      </span>
      <v-text-field
        v-model="username"
        label="Username"
        placeholder="{{ t('register.placeholder.username') }}"
        required>
        <template #prepend>
          <v-icon>mdi-account</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="password"
        label="Password"
        placeholder="{{ t('register.placeholder.password') }}"
        type="password"
        required>
        <template #prepend>
          <v-icon>mdi-lock</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="confirmPassword"
        label="Confirm Password"
        placeholder="{{ t('register.placeholder.cpassword') }}"
        type="password"
        required>
        <template #prepend>
          <v-icon>mdi-lock</v-icon>
        </template>
      </v-text-field>
      <span v-if="confirmPassword != password" style="margin-top: -20px;">
        <v-icon color="red" size="small">mdi-alert-circle</v-icon>
        {{ $t("register.inval.password.mismatching") }}
      </span>
      <span v-if="!isStrongPassword()" style="margin-bottom: 5px;">
        <v-icon color="red" size="small">mdi-alert-circle</v-icon>
        {{ $t("register.inval.password.strenght") }}
      </span>
      <v-text-field
        v-model="invitationCode"
        label="Invitation Code"
        placeholder="{{ t('register.placeholder.invitation') }}"
        />
      <span style="margin-top: -20px;margin-bottom: 15px;">
        {{ $t("register.existing") }} <a href="/login">{{ $t("register.login") }}</a>
      </span>
      <CloudFlareCaptcha v-show="!captchaOk"/>
      <v-btn
        :loading="loading"
        :disabled="!captchaOk"
        color="primary"
        @click="register"
      >
        {{
          captchaOk ?
            $t('register.button.register') :
            $t('register.button.captcha')
        }}
      </v-btn>
    </div>
    <div v-if="registerOk">
      <v-sheet
        elevation="12"
        max-width="600"
        rounded="lg"
        width="100%"
        class="ok-screen pa-4 text-center mx-auto"
      >
        <v-icon
          class="mb-5"
          color="success"
          icon="mdi-check-circle"
          size="112"
        ></v-icon>

        <h2 class="text-h5 mb-6">{{ $t("register.sent.title") }}</h2>

        <p class="mb-4 text-medium-emphasis">
          {{ $t("register.sent.msg",{email:email.substring(email.indexOf('@') + 1)}) }}
        </p>

        <v-divider class="mb-4"></v-divider>

        <div class="text-end">
          <v-btn
            class="text-none"
            color="success"
            rounded
            href="/"
            variant="flat"
            width="90"
          >
            {{ $t("register.button.done") }}
          </v-btn>
        </div>
      </v-sheet>
    </div>
  </div>
</template>

<style scoped>
.register-form {
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

.ok-screen {
  margin-bottom: 100px;
  margin-top: 100px;
}

.captcha{
  margin: auto;
}


</style>
