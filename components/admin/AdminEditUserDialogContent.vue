<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import {
  badgeDefs,
  doFetchPut,
  type Profile,
  toastError,
} from '~/utils/constants';
import UserBadges from '~/components/UserBadges.vue';
import { toast } from 'vuetify-sonner';
import RedenRouter from '~/components/RedenRouter.vue';

const availableRoles = Object.keys(badgeDefs);
const props = defineProps<{
  item: Profile;
}>();
const emit = defineEmits<{
  close: [];
  'update:dirty': [value: boolean];
}>();

const saving = ref(false);
const mutableCopy = ref<Profile>(JSON.parse(JSON.stringify(props.item)));
const resetPassword = ref(false);
const dirty = computed(
  () => JSON.stringify(mutableCopy.value) !== JSON.stringify(props.item),
);

watch(dirty, (value) => emit('update:dirty', value), { immediate: true });

function reset() {
  mutableCopy.value = JSON.parse(JSON.stringify(props.item));
  resetPassword.value = false;
}

function close() {
  reset();
  emit('close');
}

function save() {
  saving.value = true;
  doFetchPut(`/api/admin/user/${props.item.id}`, mutableCopy.value)
    .then(async (res) => {
      if (res.ok) {
        const updated: Profile = await res.json();
        mutableCopy.value = JSON.parse(JSON.stringify(updated));
        Object.assign(props.item, updated);
        toast.success('Success', {
          description: 'User updated',
          duration: 3000,
        });
      } else {
        return Promise.reject(res);
      }
    })
    .catch((e) => {
      reset();
      toastError(e, 'Failed to update user');
    });
  setTimeout(() => {
    saving.value = false;
  }, 1000);
}
</script>

<template>
  <v-card>
    <v-card-title>
      Edit user
      <reden-router :to="`/@${mutableCopy.username}`">
        {{ mutableCopy.username }}
      </reden-router>
    </v-card-title>
    <v-card-text>
      <v-text-field
        v-model="mutableCopy.username"
        label="Username"
        outlined
        dense
      />
      <v-text-field v-model="mutableCopy.bio" label="Bio" outlined dense />
      <v-text-field v-model="mutableCopy.email" label="Email" outlined dense />
      <v-switch
        v-model="resetPassword"
        label="Reset password?"
        hide-spin-buttons
        hide-details
      />
      <v-text-field
        v-show="resetPassword"
        v-model="mutableCopy.password"
        label="Password"
      />
      <v-combobox
        v-model="mutableCopy.roles"
        label="Roles"
        :items="availableRoles"
        multiple
      >
        <template #selection="data">
          <UserBadges :roles="[data.item.title]" />
        </template>
      </v-combobox>
      <p v-if="mutableCopy.githubId">Github ID: {{ mutableCopy.githubId }}</p>
      <p v-if="mutableCopy.mcUUID">Minecraft UUID: {{ mutableCopy.mcUUID }}</p>
    </v-card-text>

    <v-card-actions>
      <v-spacer />

      <v-btn text="Close" @click="close" />

      <v-btn color="primary" text="Save" :loading="saving" @click="save()" />
    </v-card-actions>
  </v-card>
</template>
