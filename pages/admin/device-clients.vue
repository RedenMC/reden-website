<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { doFetchGet, doFetchPost, toastError } from '@/utils/constants';
import { toast } from 'vuetify-sonner';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

definePageMeta({
  needLogin: true,
  needAdmin: true,
});

useHead({
  title: 'Device Flow Clients',
  titleTemplate: '%s - Admin - Reden',
});

interface DeviceFlowClient {
  id: number;
  client_id: string;
  client_name: string;
  created_at: number;
  enabled: boolean;
}

interface NewClientCredentials {
  client_id: string;
  auth_key: string;
  client_name: string;
}

const clients = ref<DeviceFlowClient[]>([]);
const loading = ref(false);
const createDialog = ref(false);
const credentialsDialog = ref(false);
const newClientName = ref('');
const newCredentials = ref<NewClientCredentials | null>(null);
const processingClientId = ref<string | null>(null);

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Client ID', key: 'client_id', sortable: false },
  { title: 'Client Name', key: 'client_name', sortable: true },
  { title: 'Created At', key: 'created_at', sortable: true },
  { title: 'Status', key: 'enabled', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
];

async function loadClients() {
  loading.value = true;
  try {
    const response = await doFetchGet('/api/admin/device-flow/list-clients');
    clients.value = await (response.json());
  } catch (e: any) {
    toastError(e);
  } finally {
    loading.value = false;
  }
}

async function createClient() {
  if (!newClientName.value.trim()) {
    toast.error('Client name is required');
    return;
  }

  loading.value = true;
  try {
    const response = await doFetchPost('/api/admin/device-flow/create-client', {
      client_name: newClientName.value.trim(),
    });

    newCredentials.value = await response.json();
    createDialog.value = false;
    credentialsDialog.value = true;
    newClientName.value = '';

    toast.success('Client created successfully!');
    await loadClients();
  } catch (e: any) {
    toastError(e);
  } finally {
    loading.value = false;
  }
}

async function toggleClientStatus(client: DeviceFlowClient) {
  processingClientId.value = client.client_id;
  try {
    const endpoint = client.enabled
      ? '/api/admin/device-flow/disable-client'
      : '/api/admin/device-flow/enable-client';

    await doFetchPost(endpoint, {
      client_id: client.client_id,
    });

    toast.success(`Client ${client.enabled ? 'disabled' : 'enabled'} successfully`);
    await loadClients();
  } catch (e: any) {
    toastError(e);
  } finally {
    processingClientId.value = null;
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard!');
}

function formatDate(timestamp: number) {
  if (!timestamp || timestamp === 0) return 'N/A';
  try {
    const date = new Date(timestamp);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString();
  } catch (e) {
    console.error('Error formatting date:', timestamp, e);
    return 'Error';
  }
}

function closeCredentialsDialog() {
  credentialsDialog.value = false;
  newCredentials.value = null;
}

onMounted(() => {
  loadClients();
});
</script>

<template>
  <v-container class="content-common">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <v-icon icon="mdi-application" class="mr-2" />
              Device Flow Clients
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="createDialog = true"
            >
              Create Client
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="clients"
              :loading="loading"
              class="elevation-1"
            >
              <template #[`item.created_at`]="{ item }">
                {{ formatDate(item.created_at) }}
              </template>

              <template #[`item.enabled`]="{ item }">
                <v-chip
                  :color="item.enabled ? 'success' : 'error'"
                  size="small"
                  variant="flat"
                >
                  {{ item.enabled ? 'Enabled' : 'Disabled' }}
                </v-chip>
              </template>

              <template #[`item.client_id`]="{ item }">
                <div class="d-flex align-center">
                  <code class="mr-2">{{ item.client_id }}</code>
                  <v-btn
                    icon="mdi-content-copy"
                    size="x-small"
                    variant="text"
                    @click="copyToClipboard(item.client_id)"
                  />
                </div>
              </template>

              <template #[`item.actions`]="{ item }">
                <v-btn
                  :color="item.enabled ? 'error' : 'success'"
                  :loading="processingClientId === item.client_id"
                  size="small"
                  variant="text"
                  @click="toggleClientStatus(item)"
                >
                  {{ item.enabled ? 'Disable' : 'Enable' }}
                </v-btn>
              </template>

              <template #no-data>
                <div class="text-center py-8">
                  <v-icon icon="mdi-application-outline" size="64" color="grey" />
                  <p class="text-h6 mt-4">No clients registered yet</p>
                  <p class="text-body-2 text-grey">Create your first device flow client to get started</p>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create Client Dialog -->
    <v-dialog v-model="createDialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon icon="mdi-plus" class="mr-2" />
          Create Device Flow Client
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="newClientName"
            label="Client Name"
            placeholder="e.g., My CLI Tool"
            variant="outlined"
            :rules="[v => !!v || 'Client name is required']"
            @keyup.enter="createClient"
          />

          <v-alert type="info" variant="tonal" class="mt-4">
            <p class="text-body-2">
              This will create a new third-party application that can authenticate users via device flow.
            </p>
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="createDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="loading"
            @click="createClient"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Credentials Dialog -->
    <v-dialog
      v-model="credentialsDialog"
      max-width="700"
      persistent
    >
      <v-card>
        <v-card-title class="bg-success">
          <v-icon icon="mdi-check-circle" class="mr-2" />
          Client Created Successfully
        </v-card-title>

        <v-card-text class="pt-6">
          <v-alert type="warning" variant="tonal" class="mb-4">
            <div class="text-h6 mb-2">⚠️ Important Security Notice</div>
            <p class="text-body-2">
              The <strong>auth_key</strong> will only be shown once.
              Please copy and securely store these credentials now.
              You will not be able to retrieve the auth_key again.
            </p>
          </v-alert>

          <v-card variant="outlined" class="mb-4">
            <v-card-text>
              <div class="mb-4">
                <div class="text-subtitle-2 text-grey mb-1">Client Name</div>
                <div class="text-h6">{{ newCredentials?.client_name }}</div>
              </div>

              <v-divider class="my-4" />

              <div class="mb-4">
                <div class="d-flex justify-space-between align-center mb-1">
                  <div class="text-subtitle-2 text-grey">Client ID</div>
                  <v-btn
                    icon="mdi-content-copy"
                    size="small"
                    variant="text"
                    @click="copyToClipboard(newCredentials?.client_id || '')"
                  />
                </div>
                <v-card color="grey-lighten-4" variant="flat">
                  <v-card-text>
                    <code class="text-body-1">{{ newCredentials?.client_id }}</code>
                  </v-card-text>
                </v-card>
              </div>

              <div>
                <div class="d-flex justify-space-between align-center mb-1">
                  <div class="text-subtitle-2 text-grey">Auth Key (Secret)</div>
                  <v-btn
                    icon="mdi-content-copy"
                    size="small"
                    variant="text"
                    @click="copyToClipboard(newCredentials?.auth_key || '')"
                  />
                </div>
                <v-card color="error-lighten-4" variant="flat">
                  <v-card-text>
                    <code class="text-body-1 text-error">{{ newCredentials?.auth_key }}</code>
                  </v-card-text>
                </v-card>
              </div>
            </v-card-text>
          </v-card>

          <v-alert type="info" variant="tonal">
            <p class="text-body-2 mb-2">
              <strong>Next steps:</strong>
            </p>
            <ol class="text-body-2" style="padding-left: 20px;">
              <li>Copy both the Client ID and Auth Key</li>
              <li>Securely share them with the application developer</li>
              <li>Refer to the <a href="/DEVICE_FLOW_API.md" target="_blank">API Documentation</a> for integration guide</li>
            </ol>
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            variant="flat"
            @click="closeCredentialsDialog"
          >
            I've Saved the Credentials
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
code {
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

.content-common {
  max-width: 1400px;
}
</style>
