<script lang="ts" setup>
import { ref } from 'vue';
import { doFetchPut, type Profile, toastError } from '~/utils/constants';
import UserBadges from '~/components/UserBadges.vue';
import { toast } from 'vuetify-sonner';

const saving = ref(false);
const availableRoles = ['sponsor', 'staff', 'developer', 'contributor'];
const props = defineProps<{
  item: Profile;
}>();
const mutableCopy = ref<Profile>(JSON.parse(JSON.stringify(props.item)));
const resetPassword = ref(false);

function save() {
  saving.value = true;
  doFetchPut(`/api/admin/user/${props.item.id}`, mutableCopy.value)
    .then(async (res) => {
      if (res.ok) {
        toast('Success', {
          description: 'User updated',
          duration: 3000,
          cardProps: {
            color: 'green',
          },
        });
      } else {
        return Promise.reject(res);
      }
    })
    .catch((e) => {
      mutableCopy.value = JSON.parse(JSON.stringify(props.item));
      toastError(e, 'Failed to update user');
    });
  setTimeout(() => {
    saving.value = false;
  }, 1000);
}

function changed() {
  return JSON.stringify(mutableCopy.value) != JSON.stringify(props.item);
}
</script>

<template>
  <v-btn
    color="surface-variant"
    icon="mdi-pencil"
    text="Open Dialog"
    variant="flat"
  >
    <!-- wtf-->
    <v-icon icon="mdi-pencil" />
    <v-dialog max-width="500" activator="parent" :persistent="changed()">
      <template #default="{ isActive }">
        <v-card>
          <v-card-title>
            Edit user
            <NuxtLink :to="localePath(`/@${mutableCopy.username}`)">{{
              mutableCopy.username
            }}</NuxtLink>
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="mutableCopy.username"
              label="Username"
              outlined
              dense
            />
            <v-text-field
              v-model="mutableCopy.bio"
              label="Bio"
              outlined
              dense
            />
            <v-text-field
              v-model="mutableCopy.email"
              label="Email"
              outlined
              dense
            />
            <v-switch
              label="Reset password?"
              hide-spin-buttons
              hide-details
              v-model="resetPassword"
            />
            <v-text-field
              v-show="resetPassword"
              v-model="mutableCopy.password"
              label="Password"
            />
            <v-combobox
              label="Roles"
              v-model="mutableCopy.roles"
              :items="availableRoles"
              multiple
            >
              <template v-slot:selection="data">
                <UserBadges :roles="[data.item.title]" />
              </template>
            </v-combobox>
            <p v-if="mutableCopy.githubId">
              Github ID: {{ mutableCopy.githubId }}
            </p>
            <p v-if="mutableCopy.mcUUID">
              Minecraft UUID: {{ mutableCopy.mcUUID }}
            </p>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
              text="Close"
              @click="
                isActive.value = false;
                mutableCopy = JSON.parse(JSON.stringify(props.item));
              "
            />

            <v-btn
              color="primary"
              text="Save"
              :loading="saving"
              @click="save()"
            />
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </v-btn>
</template>
