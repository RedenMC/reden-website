<script lang="ts" setup>
import { doFetchDelete, getOauth, type OAuthAccount } from '@/utils/constants';
import { ref } from 'vue';
import { toast } from 'vuetify-sonner';

const account = ref<OAuthAccount>();
const loading = ref(true);

const { type, icon } = defineProps<{
  type: string;
  icon?: string;
}>();

if (import.meta.client) {
  getOauth(type, `/api/account/${type}`, account).then(() => {
    loading.value = false;
  });
}
function unlinkAccount(type: string) {
  doFetchDelete(`/api/account/${type}`).then((response) => {
    if (response.ok) {
      account.value = undefined;
      toast('Account unlinked', {
        cardProps: {
          color: 'success',
        },
        duration: 5000,
      });
    } else {
      toast(response.statusText, {
        cardProps: {
          color: 'error',
        },
        duration: 5000,
      });
    }
  });
}
</script>

<template>
  <v-row class="line">
    <v-col>
      <v-icon v-if="icon">{{ icon }}</v-icon>
      <span class="setting-label text-capitalize">
        {{ type }}
      </span>
    </v-col>
    <v-col>
      <p v-if="account">
        {{ account.email }}
      </p>
    </v-col>
    <v-col>
      <v-btn
        v-if="!account"
        :href="`/api/oauth/${type}?redirect_url=/home`"
        class="text-capitalize setting-button"
        color="primary"
        :loading="loading"
      >
        Link Account
      </v-btn>
      <v-btn
        v-if="account"
        class="text-capitalize setting-button"
        color="error"
        @click="unlinkAccount(type)"
        :loading="loading"
      >
        Unlink Account
      </v-btn>
    </v-col>
  </v-row>
</template>

<style scoped>
.line {
  margin: 10px;
}
</style>
