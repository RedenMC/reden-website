<script lang="ts" setup>
import { doFetchGet, doFetchPost, toastError } from '@/utils/constants';
import { useAppStore } from '@/store/app';
import { toast } from 'vuetify-sonner';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();

const token = ref<string>('');
const loading = ref(true);
const processing = ref(false);
const clientInfo = ref<{
  client_id: string;
  client_name: string;
  status: string;
  created_at: number;
  expires_at: number;
  error?: string;
} | null>(null);
const error = ref<string>('');

useHead({
  title: t('device_authorization.title'),
  titleTemplate: '%s - Reden',
});

useSeoMeta({
  ogTitle: t('device_authorization.title'),
  description: t('device_authorization.login_required'),
});

onMounted(async () => {
  token.value = (route.query.token as string) || '';

  if (!token.value) {
    error.value = t('device_authorization.error.missing_token');
    loading.value = false;
    return;
  }

  try {
    const response = await doFetchGet(
      `/api/auth/device/info?token=${token.value}`,
    );
    clientInfo.value = await response.json();

    if (clientInfo.value?.status !== 'pending') {
      error.value =
        clientInfo.value?.error ||
        t('device_authorization.error.already_processed', {
          status: clientInfo.value?.status,
        });
    }
  } catch (e: any) {
    error.value = e.message || t('device_authorization.error.load_failed');
  } finally {
    loading.value = false;
  }
});

async function handleConsent(approve: boolean) {
  if (!useAppStore().logined) {
    const redirectUrl = `/auth/device?token=${token.value}`;
    await router.push(
      localePath(`/login?redirect=${encodeURIComponent(redirectUrl)}`),
    );
    return;
  }

  processing.value = true;

  try {
    const response = await doFetchPost('/api/auth/device/consent', {
      token: token.value,
      approve: approve,
    });
    const data = await response.json();

    toast.success(
      data.message ||
        (approve
          ? t('device_authorization.success.authorized')
          : t('device_authorization.success.denied')),
    );

    setTimeout(() => {
      router.push(localePath('/home'));
    }, 2000);
  } catch (e: any) {
    toastError(e);
  } finally {
    processing.value = false;
  }
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}
</script>

<template>
  <div class="">
    <v-container class="fill-height" fluid>
      <v-row justify="center" align="center">
        <v-col cols="12" sm="8" md="6" lg="5" xl="4">
          <v-card class="elevation-12">
            <v-card-title class="text-h5 text-center pa-6">
              <v-icon icon="mdi-devices" size="48" class="mr-2" />
              {{ t('device_authorization.title') }}
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-6">
              <div v-if="loading" class="text-center py-8">
                <v-progress-circular indeterminate color="primary" size="64" />
                <p class="mt-4 text-body-1">
                  {{ t('device_authorization.loading') }}
                </p>
              </div>

              <div v-else-if="error" class="text-center py-8">
                <v-icon icon="mdi-alert-circle" color="error" size="64" />
                <p class="mt-4 text-h6 text-error">{{ error }}</p>
                <v-btn
                  :to="localePath('/home')"
                  color="primary"
                  class="mt-4"
                  variant="flat"
                >
                  {{ t('device_authorization.button.go_home') }}
                </v-btn>
              </div>

              <div v-else-if="clientInfo">
                <v-alert
                  v-if="!useAppStore().logined"
                  type="info"
                  variant="tonal"
                  class="mb-4"
                >
                  {{ t('device_authorization.login_required') }}
                </v-alert>

                <div class="authorization-details">
                  <p class="text-h6 mb-4">
                    {{ t('device_authorization.request_details') }}
                  </p>

                  <v-list lines="two" class="bg-transparent">
                    <v-list-item>
                      <template #prepend>
                        <v-icon icon="mdi-application" />
                      </template>
                      <v-list-item-title>{{
                        t('device_authorization.application')
                      }}</v-list-item-title>
                      <v-list-item-subtitle>{{
                        clientInfo.client_name
                      }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template #prepend>
                        <v-icon icon="mdi-clock-outline" />
                      </template>
                      <v-list-item-title>{{
                        t('device_authorization.requested_at')
                      }}</v-list-item-title>
                      <v-list-item-subtitle>{{
                        formatDate(clientInfo.created_at)
                      }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>

                  <v-alert type="warning" variant="tonal" class="mt-4 mb-4">
                    <p class="text-body-2">
                      <strong>{{ clientInfo.client_name }}</strong>
                      {{ t('device_authorization.is_requesting') }}
                    </p>
                    <ul class="mt-2">
                      <li>
                        {{ t('device_authorization.warning.access_profile') }}
                      </li>
                      <li>
                        {{ t('device_authorization.warning.perform_actions') }}
                      </li>
                    </ul>
                    <p class="mt-2 text-body-2">
                      {{ t('device_authorization.warning.trust_notice') }}
                    </p>
                  </v-alert>
                </div>
              </div>
            </v-card-text>

            <v-divider v-if="clientInfo && !error" />

            <v-card-actions
              v-if="clientInfo && !error"
              class="pa-6 justify-space-between"
            >
              <v-btn
                color="error"
                variant="outlined"
                size="large"
                :disabled="processing"
                :loading="processing"
                @click="handleConsent(false)"
                class="flex-grow-1 mr-2"
              >
                <v-icon start icon="mdi-close-circle" />
                Deny
              </v-btn>

              <v-btn
                color="success"
                variant="flat"
                size="large"
                :disabled="processing || !useAppStore().logined"
                :loading="processing"
                @click="handleConsent(true)"
                class="flex-grow-1 ml-2"
              >
                <v-icon start icon="mdi-check-circle" />
                Authorize
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.authorization-details ul {
  list-style-position: inside;
  padding-left: 0;
}
</style>
