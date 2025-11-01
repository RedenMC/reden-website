<template>
  <v-card>
    <v-card-title>{{ t('reden.profile.bind_phone_number') }}</v-card-title>
    <v-card-text>
      <v-text-field
        v-model="phoneNumber"
        :label="t('reden.profile.phone_number')"
        :disabled="loading"
      ></v-text-field>
      <v-text-field
        v-model="code"
        :label="t('reden.profile.verification_code')"
        :disabled="loading"
      >
        <template v-slot:append>
          <v-btn
            :disabled="loading || countdown > 0 || !captcha?.token"
            @click="sendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : t('reden.profile.send_code') }}
          </v-btn>
        </template>
      </v-text-field>
      <CommonCaptcha v-model="captcha" />
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        :loading="loading"
        @click="bindPhoneNumber"
      >
        {{ $t('reden.profile.bind') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CommonCaptcha from '~/components/CommonCaptcha.vue';
import { type Captcha, doFetchPost, toastError } from '~/utils/constants';
import { toast } from 'vuetify-sonner';

const { t } = useI18n();
const emit = defineEmits<{
  close: [];
}>();

const phoneNumber = ref('');
const code = ref('');
const loading = ref(false);
const countdown = ref(0);
const captcha = ref<Captcha>();

const sendCode = async () => {
  loading.value = true;
  try {
    const response = await doFetchPost('/api/account/send-sms-code', {
      phoneNumber: phoneNumber.value,
      captcha: captcha.value,
    });
    if (!response.ok) {
      return Promise.reject(response);
    }
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error) {
    toastError(error, 'Failed to send code');
  } finally {
    loading.value = false;
  }
};

const bindPhoneNumber = async () => {
  loading.value = true;
  try {
    const response = await doFetchPost('/api/account/bind-phone-number', {
      phoneNumber: phoneNumber.value,
      code: code.value,
    });
    if (!response.ok) {
      return Promise.reject(response);
    }
    toast.success('成功', {
      description: '手机号绑定成功',
    });
    refreshNuxtData().then(() => emit('close'));
  } catch (error) {
    toastError(error, 'Failed to bind phone number');
  } finally {
    loading.value = false;
  }
};
</script>
