<script lang="ts" setup>
import {Ref, ref, VueElement} from 'vue';
import {doFetchDelete, Profile, toastError} from '@/constants';
import UserBadges from '@/components/UserBadges.vue';
import VerifyMinecraft from '@/components/VerifyMinecraft.vue';
import {toast} from 'vuetify-sonner';
import {useAppStore} from '@/store/app';

const {user, canEdit, applyPreference} = defineProps({
  user: {
    type: Object as () => Ref<Profile | undefined>,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: true,
  },
  applyPreference: Boolean,
});

defineSlots<{
  actions: VueElement[] | undefined;
}>();

const uploader = ref<HTMLInputElement>();
const selectedFile = ref<File | null | undefined>();

function editAvatar() {
  uploader.value?.click();
}

function fileSelected() {
  const file = uploader.value?.files?.item(0);
  selectedFile.value = file;
  console.log(file);
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    toastError(
      {
        error: 'File too large',
      },
      'Failed to update avatar',
    );
    return;
  }
  fetch('/api/account/avatar', {
    method: 'PUT',
    body: file,
    headers: {
      'X-CSRF-Token': useAppStore().csrfToken || '<no csrf token>',
    },
  })
    .then((response) => {
      if (response.ok) {
        console.log('avatar updated');
        toast('Success', {
          description: 'Avatar updated',
          duration: 3e4,
          cardProps: {
            color: 'green',
          },
        });
        window.location.reload();
      } else {
        return Promise.reject(response);
      }
    })
    .catch((e) => toastError(e, 'Failed to update avatar'));
}

function deleteAvatar() {
  doFetchDelete('/api/account/avatar')
    .then((response) => {
      if (response.ok) {
        console.log('avatar deleted');
        toast('Success', {
          description: 'Avatar deleted',
          duration: 3e4,
          cardProps: {
            color: 'green',
          },
        });
        window.location.reload();
      } else {
        return Promise.reject(response);
      }
    })
    .catch((e) => toastError(e, 'Failed to delete avatar'));
}
</script>
<template>
  <v-card :elevation="10" class="profile-card">
    <div class="profile-card-content">
      <v-hover>
        <template #default="{ isHovering, props }">
          <div
            v-if="canEdit"
            v-show="isHovering"
            class="edit-avatar"
            v-bind="props"
          >
            <v-hover>
              <template #default="{ isHovering, props }">
                <v-btn
                  :color="isHovering ? 'primary' : undefined"
                  icon="mdi-pencil"
                  v-bind="props"
                  @click="editAvatar"
                />
              </template>
            </v-hover>
            <v-hover v-if="user?.avatarUrl">
              <template #default="{ isHovering, props }">
                <v-btn
                  :color="isHovering ? 'red' : undefined"
                  icon="mdi-delete"
                  v-bind="props"
                  @click="deleteAvatar"
                />
              </template>
            </v-hover>
          </div>
          <input
            ref="uploader"
            accept="image/*"
            class="d-none"
            type="file"
            @change="fileSelected"
          />
          <div class="user-avatar-border" v-bind="props">
            <v-avatar :image="user?.avatarUrl" :size="200" />
          </div>
        </template>
      </v-hover>
      <h1 class="user-name">
        {{ user?.username }}
      </h1>
      <UserBadges :roles="user?.roles" />
      <p v-if="user?.bio" class="user-bio">
        {{ user?.bio }}
      </p>
      <div v-if="user" class="user-details-list">
        <p class="user-id">
          <v-icon class="profile-item-icon">mdi-account</v-icon>
          <span>uid: {{ user.id }}</span>
        </p>
        <p v-if="user.email && (!applyPreference || user.preference.showEmail)" class="user-email">
          <v-icon class="profile-item-icon">mdi-email</v-icon>
          <a :href="'mailto:' + user?.email" class="link"> {{ user?.email }} </a>
        </p>
        <p v-if="user?.preference?.pronouns" class="user-pronoun">
          <span>{{ user?.preference?.pronouns }}</span>
        </p>
        <p v-if="user.mcUUID && (!applyPreference || user.preference.showMC)" class="minecraft">
          <v-icon class="profile-item-icon">mdi-minecraft</v-icon>
          <VerifyMinecraft :showActions="canEdit" :user="user" />
        </p>
        <p v-if="!applyPreference || user.preference.showGithub" class="user-github">
          <v-icon class="profile-item-icon">mdi-github</v-icon>
          <span v-if="user?.githubId != null">
            <a :href="'//github.com/' + user.githubId" class="link">
              {{ user!.githubId }}
            </a>
          </span>
          <span v-else>
          Account not linked
          <a v-if="canEdit" href="/api/oauth/github?redirect_url=/home">
            Link Now
          </a>
        </span>
        </p>
        <p v-if="user.preference.timezone" class="user-timezone">
          <v-icon class="profile-item-icon">mdi-clock</v-icon>
          <span>{{
            new Date().toLocaleString('en-us', { timeZone: user.preference.timezone})
          }}</span>
        </p>
      </div>
      <slot name="actions" />
    </div>
  </v-card>
</template>
<style scoped>
.profile-card {
  margin: 20px;
  width: 300px;
}

.user-name {
  text-align: center;
  font-size: 2em;
  margin: 0;
  padding: 0;
  font-weight: bold;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
}

p {
  color: #cccccc;
}

a.link {
  color: #cccccc;
  text-decoration: none;
  transition: all 0.5s;
}

a:hover.link {
  color: #eeeeee;
  text-decoration: underline;
  transition: all 0.5s;
}

.profile-card-content {
  padding: 16px;
}

.user-avatar-border {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.profile-item-icon {
  margin-right: 6px;
}

.edit-avatar {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-bio {
  color: #eeeeee;
  font-size: 1.2em;
}

.user-details-list {
  margin-top: 12px;
  margin-bottom: 12px;
}
</style>
