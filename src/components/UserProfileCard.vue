<script lang="ts" setup>
import { ref, VueElement, toRefs } from 'vue';
import { doFetchDelete, Profile, toastError } from '@/constants';
import UserBadges from '@/components/UserBadges.vue';
import VerifyMinecraft from '@/components/VerifyMinecraft.vue';
import { toast } from 'vuetify-sonner';
import { useAppStore } from '@/store/app';
import { getTimezone } from 'countries-and-timezones';

const props = withDefaults(
  defineProps<{
    user?: Profile;
    canEdit: boolean;
    applyPreference?: boolean;
  }>(),
  {
    canEdit: true,
  },
);
const { user, canEdit, applyPreference } = toRefs(props);

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
      <p v-if="user?.preference?.pronouns" class="user-pronoun">
        <span>{{ user?.preference?.pronouns }}</span>
      </p>

      <div v-if="user" class="user-details-list">
        <p class="user-id">
          <v-icon class="profile-item-icon">mdi-account</v-icon>
          <span>uid: {{ user.id }}</span>
        </p>
        <p
          v-if="user.email && (!applyPreference || user.preference.showEmail)"
          class="user-email"
        >
          <v-icon class="profile-item-icon">mdi-email</v-icon>
          <a :href="'mailto:' + user?.email">
            {{ user?.email }}
          </a>
        </p>
        <p
          v-if="user.mcUUID && (!applyPreference || user.preference.showMC)"
          class="minecraft"
        >
          <v-icon class="profile-item-icon">mdi-minecraft</v-icon>
          <VerifyMinecraft :showActions="canEdit" :user="user" />
        </p>
        <p
          v-if="!applyPreference || user.preference.showGithub"
          class="user-github"
        >
          <v-icon class="profile-item-icon">mdi-github</v-icon>
          <span v-if="user?.githubId != null">
            <a :href="'//github.com/' + user.githubId">
              {{ user!.githubId }}
            </a>
          </span>
          <template v-else>
            <span>Account not linked</span>
            <!-- prettier-ignore -->
            <a v-if="canEdit" href="/api/oauth/github?redirect_url=/home">Link Now</a>
          </template>
        </p>
        <p v-if="user.preference.timezone" class="user-timezone">
          <v-icon class="profile-item-icon">mdi-clock</v-icon>
          <span>{{
            new Date().toLocaleString('en-us', {
              timeZone: user.preference.timezone,
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          }}</span>
          <span
            v-if="
              -new Date().getTimezoneOffset() ==
              getTimezone(user.preference.timezone)?.utcOffset
            "
          >
            (Your timezone)
          </span>
        </p>
      </div>

      <!-- followers and following and following projects -->
      <div>
        <p class="user-followers">
          <v-icon class="profile-item-icon">mdi-account-group</v-icon>
          <span>{{ user?.followers || 0 }} followers </span>
        </p>
        <p class="user-following">
          <v-icon class="profile-item-icon">mdi-account-group-outline</v-icon>
          <span>{{ user?.following || 0 }} following </span>
        </p>
        <p class="user-following-projects">
          <v-icon class="profile-item-icon">mdi-source-branch</v-icon>
          <span>{{ user?.followingProjects || 0 }} following projects </span>
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
}

p {
  opacity: 0.8;
}

a {
  color: inherit;
  opacity: 0.8;
  text-decoration: none;
  transition: all 0.5s;
}

a:hover {
  color: inherit;
  opacity: 1;
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
  opacity: 1;
  font-size: 1.2em;
}

.user-pronoun {
  opacity: 0.5;
}

.user-details-list {
  margin-top: 12px;
  margin-bottom: 12px;
}
</style>
