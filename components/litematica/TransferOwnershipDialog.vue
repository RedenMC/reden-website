<script lang="ts" setup>
import { toast } from 'vuetify-sonner';
import { toastError } from '~/utils/constants';

const props = defineProps<{
  machineId: string;
}>();
const { t } = useI18n();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'transferred'): void;
}>();

const loading = ref(false);
const userId = ref('');

const { data: userInfo } = useFetch<Profile>(
  () => `/api/users/${userId.value}`,
);

async function transfer() {
  if (!userId.value || !userInfo.value) return;

  loading.value = true;
  const response = await doFetchPost(
    `/api/mc-services/yisibite/${props.machineId}/transfer`,
    {
      uid: parseInt(userId.value),
    },
  );

  if (!response.ok) {
    loading.value = false;
    return toastError(response);
  }

  toast.success('Ownership transferred successfully');
  emit('transferred');
  emit('close');
  loading.value = false;
}
</script>

<template>
  <v-card>
    <v-card-title>{{ t('post.transfer_ownership') }}</v-card-title>
    <v-card-text>
      <v-text-field v-model="userId" label="New Owner User ID" type="number" />

      <v-alert
        v-if="userId"
        :color="userInfo ? 'success' : 'warning'"
        :icon="userInfo ? 'mdi-account-check' : 'mdi-account-question'"
        border
        variant="tonal"
      >
        <template v-if="userInfo">
          <div class="d-flex align-center">
            <v-avatar
              v-if="userInfo.avatarUrl"
              :image="userInfo.avatarUrl"
              class="mr-2"
              size="32"
            />
            <span>Transfer to: {{ userInfo.username }}</span>
          </div>
        </template>
        <template v-else> User not found</template>
      </v-alert>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn :disabled="loading" variant="outlined" @click="emit('close')">
        {{ t('common.cancel') }}
      </v-btn>
      <v-btn
        :disabled="!userInfo"
        :loading="loading"
        color="primary"
        variant="outlined"
        @click="transfer"
      >
        Transfer
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
