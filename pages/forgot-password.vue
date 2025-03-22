<script lang="ts" setup>
import { toast } from 'vuetify-sonner';

const email = ref('');
const captcha = ref<Captcha>();
const emailSent = ref(false);
const localePath = useLocalePath();
const { t } = useI18n();

async function submit() {
  console.log(email);
  const response = await doFetchPost('/api/account/forgot-password', {
    email: email.value,
    captcha: captcha.value,
  });
  if (response.ok) {
    emailSent.value = true;
  }
  if (response.status === 429) {
    toast.error(t('reset_pass.please_wait_for_a_while'), {
      description: t('reset_pass.you_can_only_request'),
    });
  } else {
    await toastError(response);
  }
}
</script>

<template>
  <v-container class="content-common">
    <v-dialog :model-value="emailSent" close-delay="" max-width="550">
      <v-card>
        <v-card-title>{{ t('reset_pass.email_sent') }}</v-card-title>
        <v-card-text>
          <p>{{ t('reset_pass.email_sent_desc') }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn :to="localePath('/login')" color="primary">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>{{ t('reset_pass.forgot_password') }}</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="submit">
              <v-text-field
                v-model="email"
                :label="t('reset_pass.input_email')"
                required
                type="email"
              />
              <common-captcha v-model="captcha" />
              <v-btn :disabled="!captcha?.token" color="primary" type="submit">
                {{ t('reset_pass.submit') }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
