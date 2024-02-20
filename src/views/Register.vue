<script lang="ts" setup>
import {toast, VSonner} from "vuetify-sonner";
import CloudFlareCaptcha, {getCFToken} from "@/components/CloudFlareCaptcha.vue";
import {onMounted, onUnmounted, ref} from "vue";
import {useCaptchaStore} from "@/store/captcha";
import doFetchPost from "@/constants";
import { useI18n } from 'vue-i18n'
import {isStrongPassword} from "@/constants";

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
  if (!isStrongPassword(password.value)) return
  if (confirmPassword.value != password.value) return
  if (email.value.indexOf('@') == -1) return
  if (!/^[\w\-\u4e00-\u9fa5]{3,20}$/.test(username.value)) return
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
    console.error('error', e)
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

</script>

<template>
  <VSonner :expand="true" position="top-center"/>

  <div class="main-page">
    <div v-if="!registerOk" class="register-form">
      <h1>
        {{ $t('register.title') }}
      </h1>
      <v-text-field
        v-model="email"
        :label="t('register.placeholder.email')"
        :placeholder="t('register.placeholder.email')"
        :rules="[() => /.+@.+\..+/i.test(email) || $t('register.inval.email')]"
        required>
        <template #prepend>
          <v-icon>mdi-email</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="username"
        :label="t('register.placeholder.username')"
        :placeholder="t('register.placeholder.username')"
        :rules="[() => /^[\w\-\u4e00-\u9fa5]{3,20}$/.test(username) || $t('register.inval.username')]"
        required>
        <template #prepend>
          <v-icon>mdi-account</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="password"
        :label="t('register.placeholder.password')"
        :placeholder="t('register.placeholder.password')"
        :rules="[() => isStrongPassword() || $t('register.inval.password.strenght')]"
        required
        type="password">
        <template #prepend>
          <v-icon>mdi-lock</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="confirmPassword"
        :label="t('register.placeholder.confirm')"
        :placeholder="t('register.placeholder.confirm')"
        :rules="[() => confirmPassword == password || $t('register.inval.password.mismatching')]"
        required
        type="password">
        <template #prepend>
          <v-icon>mdi-lock</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="invitationCode"
        :label="t('register.placeholder.invitation')"
        :placeholder="t('register.placeholder.invitation')"
        />
      <span >
        {{ $t("register.existing") }} <a href="/login">{{ $t("register.login") }}</a>
      </span>
      <CloudFlareCaptcha v-show="!captchaOk"/>
      <v-btn
        :disabled="!captchaOk"
        :loading="loading"
        color="primary"
        @click="register"
      >
        {{
          captchaOk ?
            $t('register.button.register') :
            $t('register.button.captcha')
        }}
      </v-btn>

      <h1>
        {{
          $t('register.oauth')
        }}
      </h1>
      <v-btn
        color="blue"
        href="/api/oauth/microsoft"
        prepend-icon="mdi-microsoft"
        :block="true"
      >
        Microsoft
      </v-btn>
    </div>

    <div v-if="registerOk">
      <v-sheet
        class="ok-screen pa-4 text-center mx-auto"
        elevation="12"
        max-width="600"
        rounded="lg"
        width="100%"
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
            href="/"
            rounded
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
