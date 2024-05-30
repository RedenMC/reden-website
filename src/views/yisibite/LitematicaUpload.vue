<template>
  <v-btn>
    Upload
    <v-dialog activator="parent" max-width="600">
      <v-card>
        <v-card-title>Upload Machine</v-card-title>
        <v-form @submit="submit">
          <v-col>
            <v-text-field label="path" v-model="path">
              <template #details>
                {{
                  cache?.approved
                    ? 'Approved'
                    : cache?.approved === false
                      ? 'Rejected'
                      : 'Querying'
                }}
              </template>
            </v-text-field>
            <v-text-field label="name" v-model="name" />
            <v-file-input
              label="file"
              v-model="file"
              :rules="[
                () =>
                  (file?.name?.endsWith('.litematic') ?? false) ||
                  'Must be litematica files.',
              ]"
              clearable
            />
          </v-col>
          <v-col>
            <v-row>
              <v-spacer />
              <v-btn color="primary" type="submit" :loading="loading"
                >Upload</v-btn
              >
            </v-row>
          </v-col>
        </v-form>
      </v-card>
    </v-dialog>
  </v-btn>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { SubmitEventPromise } from 'vuetify';
import { doFetchGet, doFetchPut, toastError } from '@/constants';
import { toast } from 'vuetify-sonner';

const file = ref<File>();
const loading = ref(false);
const path = ref('');
const name = ref('');

const cache = ref<{
  name: string;
  approved: boolean;
}>();
const uploadCache = (name: string) => {
  doFetchGet(`/api/mc-services/yisibite/${name}/approval`)
    .then((res) => {
      if (!res.ok) return Promise.reject(res);
      return res.json();
    })
    .then((res) => {
      cache.value = res;
    })
    .catch((e) => toastError(e));
};

function submit(e: SubmitEventPromise) {
  console.log(file.value);
  e.preventDefault();
  e.then((a) => {
    if (a.valid) {
      loading.value = true;
      const data = new FormData();
      data.set('name', name.value);
      data.set('id', path.value);
      data.set('file', file.value!);
      doFetchPut('/api/mc-services/yisibite/', data)
        .then((res) => {
          if (!res.ok) return Promise.reject(res);
          toast('OK', {
            cardProps: {
              color: 'green',
            },
          });
        })
        .catch((e) => toastError(e))
        .finally(() => (loading.value = false));
    } else {
      toastError(a.errors[0].errorMessages.join(' '));
    }
  });
}
</script>
<style scoped>
p {
  font-size: 1em;
}
</style>
