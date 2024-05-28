<template>
  <v-btn>
    Upload
    <v-dialog activator="parent">
      <v-card>
        <v-form @submit="submit">
          <v-text-field label="path" v-model="path" />
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
          <v-btn type="submit" :loading="loading">Upload</v-btn>
        </v-form>
      </v-card>
    </v-dialog>
  </v-btn>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { SubmitEventPromise } from 'vuetify';
import { doFetchPut, toastError } from '@/constants';
import { toast } from 'vuetify-sonner';

const file = ref<File>();
const loading = ref(false);
const path = ref('');
const name = ref('');

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
