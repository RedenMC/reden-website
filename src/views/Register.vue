<script lang="ts" setup>
import { toast } from 'vuetify-sonner';
import { ref } from 'vue';
import VueTurnstile from 'vue-turnstile';
import {
  cloudflareCAPTCHAKey,
  doFetchPost,
  isStrongPassword,
  toastError,
  usernameRegex,
} from '@/constants';
import { useI18n } from 'vue-i18n';
import RedenRouter from '@/router/RedenRouter.vue';
import { SubmitEventPromise } from 'vuetify';

const email = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const invitationCode = ref('');
const loading = ref(false);
const registerOk = ref(false);
const token = ref('');
const { t } = useI18n();
function register(e: SubmitEventPromise) {
  e.preventDefault();
  e.then((e) => {
    if (!e.valid) return;
    loading.value = true;
    const req = {
      email: email.value,
      username: username.value,
      password: password.value,
      invitationCode: invitationCode.value,
      timestamp: new Date().getTime(),
      captcha: {
        token: token.value,
        provider: 'cloudflare',
      },
    };
    doFetchPost('/api/account/register/start', req)
      .then((res) => {
        if (res.ok) {
          toast(t('register.toast.successful.title'), {
            description: t('register.toast.successful.message'),
            duration: 1000,
            cardProps: {
              color: 'green',
            },
          });
          registerOk.value = true;
        } else {
          return Promise.reject(res);
        }
      })
      .catch((e) => toastError(e, 'Failed to register'))
      .finally(() => {
        loading.value = false;
      });
  });
}
</script>

<template>
  <div class="main-page">
    <v-form v-if="!registerOk" @submit="register" class="register-form">
      <h1>
        {{ $t('register.title') }}
      </h1>
      <v-text-field
        v-model="email"
        :label="t('register.placeholder.email')"
        :placeholder="t('register.placeholder.email')"
        :rules="[
          () => /.+@.+\..+/i.test(email) || $t('register.invalid.email'),
        ]"
        required
      >
        <template #prepend>
          <v-icon>mdi-email</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="username"
        :label="$t('register.placeholder.username')"
        :placeholder="$t('register.placeholder.username')"
        :rules="[
          () => usernameRegex.test(username) || $t('register.invalid.username'),
        ]"
        required
      >
        <template #prepend>
          <v-icon>mdi-account</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="password"
        :label="t('register.placeholder.password')"
        :placeholder="t('register.placeholder.password')"
        :rules="[
          () =>
            isStrongPassword(password) ||
            $t('register.invalid.password.strength'),
        ]"
        required
        type="password"
      >
        <template #prepend>
          <v-icon>mdi-lock</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="confirmPassword"
        :label="t('register.placeholder.confirm')"
        :placeholder="$t('register.placeholder.confirm')"
        :rules="[
          () =>
            confirmPassword == password ||
            $t('register.invalid.password.mismatching'),
        ]"
        required
        type="password"
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
      <v-text-field
        v-model="invitationCode"
        :label="t('register.placeholder.invitation_code')"
        :placeholder="t('register.placeholder.invitation_code')"
      />
      <span>
        {{ $t('register.existing') }}
        <reden-router to="/login">{{ $t('register.login') }}</reden-router>
      </span>
      <v-btn
        :disabled="!token"
        :loading="loading"
        color="primary"
        type="submit"
      >
        {{
          token ? $t('register.button.register') : $t('register.button.captcha')
        }}
      </v-btn>

      <h1>
        {{ $t('register.oauth') }}
      </h1>
      <v-btn
        color="blue"
        href="/api/oauth/microsoft"
        prepend-icon="mdi-microsoft"
        :block="true"
      >
        Microsoft
      </v-btn>
    </v-form>

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

        <h2 class="text-h5 mb-6">
          {{ $t('register.email_verification.title') }}
        </h2>
        <span>{{
          $t('register.email_verification.message', { email: email })
        }}</span>

        <v-divider class="mb-4"></v-divider>

        <v-row>
          <v-spacer />
          <router-link to="/">
            <v-btn
              class="text-none"
              color="success"
              rounded
              variant="flat"
              width="90"
            >
              {{ $t('register.button.done') }}
            </v-btn>
          </router-link>
        </v-row>
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

.captcha {
  margin: auto;
}
</style>
