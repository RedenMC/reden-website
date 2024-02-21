<script lang="ts" setup>
import { toast } from 'vuetify-sonner';
import {ref, watch} from 'vue';
import VueTurnstile from "vue-turnstile";
import {cloudflareCAPTCHAKey, doFetchPost, isStrongPassword, toastError} from '@/constants';

const email = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const invitationCode = ref('');
const loading = ref(false);
const registerOk = ref(false);
const token = ref('');

function register() {
  if (!isStrongPassword(password.value)) return;
  if (confirmPassword.value != password.value) return;
  if (email.value.indexOf('@') == -1) return;
  if (!/^[\w\-\u4e00-\u9fa5]{3,20}$/.test(username.value)) return;
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
    .then(res => {
      if (res.ok) {
        toast('Register Successful', {
          description: 'Please check your email to complete the registration',
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
    .catch(e => toastError(e, 'Failed to register'))
    .finally(() => {
      loading.value = false;
    });
}
</script>

<template>
  <div class="main-page">
    <div v-if="!registerOk" class="register-form">
      <h1>Register RedenMC Account</h1>
      <v-text-field
        v-model="email"
        label="Email"
        placeholder="Email"
        :rules="[() => /.+@.+\..+/i.test(email) || 'Invalid email address']"
        required
      >
        <template #prepend>
          <v-icon>mdi-email</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="username"
        label="Username"
        placeholder="Username"
        :rules="[
          () =>
            /^[\w\-\u4e00-\u9fa5]{3,20}$/.test(username) || 'Invalid username',
        ]"
        required
      >
        <template #prepend>
          <v-icon>mdi-account</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="password"
        :rules="[
          () =>
            isStrongPassword(password) ||
            'Password is not strong enough, must contain at least 8 characters, including uppercase, lowercase, and numbers',
        ]"
        label="Password"
        placeholder="Password"
        required
        type="password"
      >
        <template #prepend>
          <v-icon>mdi-lock</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="confirmPassword"
        :rules="[() => confirmPassword == password || 'Passwords do not match']"
        label="Confirm Password"
        placeholder="Confirm Password"
        required
        type="password"
      >
        <template #prepend>
          <v-icon>mdi-lock</v-icon>
        </template>
      </v-text-field>
      <vue-turnstile :site-key="cloudflareCAPTCHAKey" v-model="token" v-show="!token" />
      <v-text-field
        v-model="invitationCode"
        label="Invitation Code (Optional)"
        placeholder="Invitation Code, optional"
      />
      <span> Already have an account? <a href="/login">Login</a> </span>
      <v-btn
        :disabled="!token"
        :loading="loading"
        color="primary"
        @click="register"
      >
        {{
          token
            ? $t('register.button.register')
            : $t('register.button.captcha')
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

        <h2 class="text-h5 mb-6">One more step</h2>

        <p class="mb-4 text-medium-emphasis">
          We have sent an email to <strong>{{ email }}</strong> with a link to
          complete your registration.
          <br />
          If you don't see the email, please check other places it might be,
          like your junk, spam, social, or other folders.
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
            Done
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
</style>
