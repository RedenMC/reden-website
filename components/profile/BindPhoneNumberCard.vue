<template>
  <v-card min-width="500">
    <div v-if="showLegalMessage">
      <v-card-title class="text-h5">{{
        $t('comments.phone_verification_required_title')
      }}</v-card-title>
      <v-card-text>
        {{ $t('comments.phone_verification_required_message') }}
      </v-card-text>
    </div>
    <v-card-title v-else>{{
      t('reden.profile.bind_phone_number')
    }}</v-card-title>
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
      <v-btn color="primary" :loading="loading" @click="bindPhoneNumber">
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

const props = withDefaults(
  defineProps<{
    showLegalMessage?: boolean;
  }>(),
  {
    showLegalMessage: false,
  },
);

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
    if (response.ok) {
      toast.success('成功', {
        description: '手机号绑定成功',
      });
      refreshNuxtData().then(() => emit('close'));
    } else {
      if (response.status === 409) {
        toast.error('绑定失败', {
          description: '该手机号已被其他账号绑定',
        });
      } else {
        try {
          const data = await response.json();
          toast.error('绑定失败', {
            description: data.error_description || response.statusText,
          });
        } catch (e) {
          toast.error('绑定失败', {
            description: response.statusText,
          });
        }
      }
    }
  } catch (error) {
    toastError(error, 'Failed to bind phone number');
  } finally {
    loading.value = false;
  }
};
</script>
