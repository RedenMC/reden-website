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
} | null>(null);
const error = ref<string>('');

useHead({
  title: 'Device Authorization',
  titleTemplate: '%s - Reden',
});

useSeoMeta({
  ogTitle: 'Device Authorization',
  description: 'Authorize device access to your Reden account.',
});

onMounted(async () => {
  token.value = (route.query.token as string) || '';
  
  if (!token.value) {
    error.value = 'Missing authorization token';
    loading.value = false;
    return;
  }
  
  try {
    const response = await doFetchGet(`/api/auth/device/info?token=${token.value}`);
    clientInfo.value = response;
    
    if (response.status !== 'pending') {
      error.value = `This authorization request has already been ${response.status}`;
    }
  } catch (e: any) {
    error.value = e.message || 'Failed to load authorization request';
  } finally {
    loading.value = false;
  }
});

async function handleConsent(approve: boolean) {
  if (!useAppStore().loggedIn) {
    const redirectUrl = `/auth/device?token=${token.value}`;
    await router.push(localePath(`/login?redirect=${encodeURIComponent(redirectUrl)}`));
    return;
  }
  
  processing.value = true;
  
  try {
    const response = await doFetchPost('/api/auth/device/consent', {
      token: token.value,
      approve: approve,
    });
    
    toast.success(response.message || (approve ? 'Device authorized successfully!' : 'Device authorization denied'));
    
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
  <div class="device-auth-page">
    <v-container class="fill-height" fluid>
      <v-row justify="center" align="center">
        <v-col cols="12" sm="8" md="6" lg="5" xl="4">
          <v-card class="elevation-12">
            <v-card-title class="text-h5 text-center pa-6">
              <v-icon icon="mdi-devices" size="48" class="mr-2" />
              Device Authorization
            </v-card-title>
            
            <v-divider />
            
            <v-card-text class="pa-6">
              <div v-if="loading" class="text-center py-8">
                <v-progress-circular indeterminate color="primary" size="64" />
                <p class="mt-4 text-body-1">Loading authorization request...</p>
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
                  Go to Home
                </v-btn>
              </div>
              
              <div v-else-if="clientInfo">
                <v-alert 
                  v-if="!useAppStore().loggedIn" 
                  type="info" 
                  variant="tonal"
                  class="mb-4"
                >
                  You need to log in first to authorize this device.
                </v-alert>
                
                <div class="authorization-details">
                  <p class="text-h6 mb-4">Authorization Request</p>
                  
                  <v-list lines="two" class="bg-transparent">
                    <v-list-item>
                      <template #prepend>
                        <v-icon icon="mdi-application" />
                      </template>
                      <v-list-item-title>Application</v-list-item-title>
                      <v-list-item-subtitle>{{ clientInfo.client_name }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template #prepend>
                        <v-icon icon="mdi-identifier" />
                      </template>
                      <v-list-item-title>Client ID</v-list-item-title>
                      <v-list-item-subtitle>{{ clientInfo.client_id }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template #prepend>
                        <v-icon icon="mdi-clock-outline" />
                      </template>
                      <v-list-item-title>Requested At</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDate(clientInfo.created_at) }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template #prepend>
                        <v-icon icon="mdi-clock-alert-outline" />
                      </template>
                      <v-list-item-title>Expires At</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDate(clientInfo.expires_at) }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                  
                  <v-alert 
                    type="warning" 
                    variant="tonal"
                    class="mt-4 mb-4"
                  >
                    <p class="text-body-2">
                      <strong>{{ clientInfo.client_name }}</strong> is requesting access to your Reden account.
                      By authorizing, you allow this application to:
                    </p>
                    <ul class="mt-2">
                      <li>Access your profile information</li>
                      <li>Perform actions on your behalf</li>
                    </ul>
                    <p class="mt-2 text-body-2">
                      Only authorize if you trust this application.
                    </p>
                  </v-alert>
                </div>
              </div>
            </v-card-text>
            
            <v-divider v-if="clientInfo && !error" />
            
            <v-card-actions v-if="clientInfo && !error" class="pa-6 justify-space-between">
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
                :disabled="processing || !useAppStore().loggedIn"
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
.device-auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.authorization-details ul {
  list-style-position: inside;
  padding-left: 0;
}
</style>
