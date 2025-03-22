<script lang="ts" setup>
import { toast } from 'vuetify-sonner';

const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();
const token = route.query.token;
const captcha = ref<Captcha>();
const password = ref('');
const confirmPassword = ref('');
const { t } = useI18n();

async function submit() {
  if (password.value !== confirmPassword.value) {
    toast.error(t('profile.edit.password.passwordsDoNotMatch'));
    return;
  }
  const response = await doFetchPost('/api/account/reset-password', {
    token,
    newPassword: password.value,
    captcha: captcha.value,
  });
  if (response.ok) {
    toast.success(t('reset_pass.success'));
    await router.push(localePath('/login'));
  } else {
    await toastError(response);
  }
}
</script>

<template>
  <v-card v-if="typeof token !== 'string'">
    <v-card-title>{{ t('reset_pass.invalid_link') }}</v-card-title>
    <v-card-text>
      <p>{{ t('reset_pass.invalid_link_info') }}</p>
      <p>
        {{ t('reset_pass.invalid_link_instruction') }}
        <nuxt-link to="/forgot-password">
          {{ t('reset_pass.invalid_link_instruction_link') }}
        </nuxt-link>
      </p>
    </v-card-text>
  </v-card>
  <v-card v-else>
    <v-form>
      <v-card-title>Reset password</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="password"
          :label="t('reset_pass.input_password')"
          required
          type="password"
        />
        <v-text-field
          v-model="confirmPassword"
          :label="t('reset_pass.confirm_password')"
          :rules="[
            (v) =>
              v === password || t('profile.edit.password.passwordsDoNotMatch'),
          ]"
          required
          type="password"
        />
        <common-captcha v-model="captcha" />
        <v-btn
          :disabled="!password || !confirmPassword || !captcha?.token"
          color="primary"
          @click="submit"
        >
          {{ t('reset_pass.submit') }}
        </v-btn>
      </v-card-text>
    </v-form>
  </v-card>
</template>
