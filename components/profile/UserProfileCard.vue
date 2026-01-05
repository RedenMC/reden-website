<script lang="ts" setup>
import { ref, toRefs, VueElement } from 'vue';
import {
  doFetchDelete,
  doFetchPut,
  type Profile,
  toastError,
} from '~/utils/constants';
import UserBadges from '~/components/UserBadges.vue';
import VerifyMinecraft from '~/components/profile/VerifyMinecraft.vue';
import BindPhoneNumberCard from '~/components/profile/BindPhoneNumberCard.vue';
import { toast } from 'vuetify-sonner';
import { getTimezone } from 'countries-and-timezones';
import { useAppStore } from '~/store/app';
import { useI18n } from 'vue-i18n';

const bindPhoneNumberDialog = ref(false);
const appStore = useAppStore();
const { t } = useI18n();

const isFollowing = ref(false);
const followLoading = ref(false);

const props = withDefaults(
  defineProps<{
    user?: Profile;
    canEdit?: boolean;
    minWidth?: number;
    applyPreference?: boolean;
  }>(),
  {
    canEdit: true,
    minWidth: 300,
  },
);
const { user, canEdit, applyPreference } = toRefs(props);

defineSlots<{
  actions: VueElement[] | undefined;
}>();

const uploader = ref<HTMLInputElement>();
const selectedFile = ref<File | null | undefined>();
const avatarUploading = ref(false);

function editAvatar() {
  uploader.value?.click();
}

function fileSelected() {
  const file = uploader.value?.files?.item(0);
  selectedFile.value = file;
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
  avatarUploading.value = true;
  doFetchPut('/api/account/avatar', file)
    .then((response) => {
      if (response.ok) {
        toast.success('Success', {
          description: 'Avatar updated',
          duration: 3e4,
        });
        window.location.reload();
      } else {
        return Promise.reject(response);
      }
    })
    .catch((e) => toastError(e, 'Failed to update avatar'))
    .finally(() => (avatarUploading.value = false));
}

function deleteAvatar() {
  doFetchDelete('/api/account/avatar')
    .then((response) => {
      if (response.ok) {
        toast.success('Success', {
          description: 'Avatar deleted',
          duration: 3e4,
        });
        window.location.reload();
      } else {
        return Promise.reject(response);
      }
    })
    .catch((e) => toastError(e, 'Failed to delete avatar'));
}

async function toggleFollow() {
  if (!user.value || followLoading.value) return;
  
  followLoading.value = true;
  try {
    const method = isFollowing.value ? 'DELETE' : 'POST';
    const response = await fetch(`/api/user/follow/${user.value.id}`, { method });
    
    if (response.ok) {
      isFollowing.value = !isFollowing.value;
      if (user.value.followers !== undefined) {
        user.value.followers += isFollowing.value ? 1 : -1;
      }
      toast.success(isFollowing.value ? t('follow.success') : t('follow.unfollowSuccess'));
    } else {
      throw await response.json();
    }
  } catch (e) {
    toastError(e, t('follow.error'));
  } finally {
    followLoading.value = false;
  }
}

async function fetchFollowStatus() {
  if (!user.value || !appStore.uid || user.value.id === appStore.uid) return;
  
  try {
    const response = await fetch(`/api/user/follow/stats/${user.value.id}`);
    if (response.ok) {
      const data = await response.json();
      isFollowing.value = data.isFollowing || false;
    }
  } catch (e) {
    console.error('Failed to fetch follow status:', e);
  }
}

onMounted(() => {
  fetchFollowStatus();
});
</script>
<template>
  <v-card :elevation="4" :min-width="minWidth" border>
    <div class="ma-4">
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
                  :loading="avatarUploading"
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
          <div class="user-avatar-wrap" v-bind="props">
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
        <p class="phone-number">
          <v-icon class="profile-item-icon">mdi-phone</v-icon>
          <span v-if="user.phoneNumber">{{ user.phoneNumber }}</span>
          <template v-else>
            {{ $t('profile.phone_not_bound') }}
            <v-dialog v-model="bindPhoneNumberDialog" max-width="500">
              <template v-slot:activator="{ props }">
                <a v-if="canEdit" class="router" v-bind="props">{{
                  $t('profile.bind_now')
                }}</a>
              </template>
              <BindPhoneNumberCard @close="bindPhoneNumberDialog = false" />
            </v-dialog>
          </template>
        </p>
        <p v-if="!applyPreference || user.preference.showMC" class="minecraft">
          <v-icon class="profile-item-icon">mdi-minecraft</v-icon>
          <VerifyMinecraft :showActions="canEdit" :user="user" />
        </p>
        <p
          v-if="!applyPreference || user.preference.showGithub"
          class="user-github"
        >
          <v-icon class="profile-item-icon">mdi-github</v-icon>
          <span v-if="user?.githubId != null">
            <a :href="'https://github.com/' + user.githubId">
              {{ user!.githubId }}
            </a>
          </span>
          <template v-else>
            {{ $t('profile.account_not_linked') }}
            <a v-if="canEdit" class="router" href="/api/oauth/github">{{
              $t('profile.link_now')
            }}</a>
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
            {{ $t('profile.your_timezone') }}
          </span>
        </p>
      </div>

      <!-- Follow button for other users -->
      <v-btn
        v-if="user && appStore.uid && user.id !== appStore.uid"
        :color="isFollowing ? 'default' : 'primary'"
        :loading="followLoading"
        block
        class="my-3"
        @click="toggleFollow"
      >
        <v-icon :icon="isFollowing ? 'mdi-account-check' : 'mdi-account-plus'" start />
        {{ isFollowing ? $t('follow.unfollow') : $t('follow.follow') }}
      </v-btn>

      <!-- followers and following and following projects -->
      <div>
        <p class="user-followers clickable-stat">
          <v-icon class="profile-item-icon">mdi-account-group</v-icon>
          <NuxtLink :to="`/user/${user?.id}/followers`" class="stat-link">
            <span>{{ user?.followers || 0 }} {{ $t('common.followers') }} </span>
          </NuxtLink>
        </p>
        <p class="user-following clickable-stat">
          <v-icon class="profile-item-icon">mdi-account-group-outline</v-icon>
          <NuxtLink :to="`/user/${user?.id}/following`" class="stat-link">
            <span>{{ user?.following || 0 }} {{ $t('common.following') }} </span>
          </NuxtLink>
        </p>
        <p class="user-following-projects">
          <v-icon class="profile-item-icon">mdi-source-branch</v-icon>
          <span
            >{{ user?.followingProjects || 0 }}
            {{ $t('common.following_projects') }}
          </span>
        </p>
      </div>
      <slot name="actions" />
    </div>
  </v-card>
</template>
<style scoped>
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

.user-avatar-wrap {
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

.clickable-stat {
  cursor: pointer;
}

.stat-link {
  color: inherit;
  text-decoration: none;
  transition: all 0.3s;
}

.stat-link:hover {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}
</style>
