<script lang="ts" setup>
import { computed, ref, toRefs, type VueElement } from 'vue';
import {
  doFetchDelete,
  doFetchGet,
  doFetchPut,
  type Profile,
  toastError,
} from '~/utils/constants';
import UserBadges from '~/components/UserBadges.vue';
import VerifyMinecraft from '~/components/profile/VerifyMinecraft.vue';
import BindPhoneNumberCard from '~/components/profile/BindPhoneNumberCard.vue';
import AdminEditUserDialogContent from '~/components/admin/AdminEditUserDialogContent.vue';
import { toast } from 'vuetify-sonner';
import { getTimezone } from 'countries-and-timezones';
import { useAppStore } from '~/store/app';

const bindPhoneNumberDialog = ref(false);
const appStore = useAppStore();
const localePath = useLocalePath();
const router = useRouter();
const { t } = useI18n();

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
const followLoading = ref(false);
const listLoading = ref(false);
const followDialog = ref(false);
const adminEditDialog = ref(false);
const adminEditDirty = ref(false);
const followDialogTitle = ref('');
const followDialogTotal = ref(0);
const followUsers = ref<
  Pick<Profile, 'id' | 'username' | 'avatarUrl' | 'isStaff'>[]
>([]);

const isSelf = computed(() => !!user.value && appStore.uid === user.value.id);
const canToggleFollow = computed(() => !!user.value && !isSelf.value);
const canAdminEditUser = computed(
  () => !!user.value && appStore.userCache?.isStaff === true,
);
const canOpenFollowers = computed(
  () => !!user.value && (isSelf.value || appStore.userCache?.isStaff === true),
);
const canOpenFollowing = computed(() => !!user.value);

type FollowListResponse = {
  total: number;
  page: number;
  pageSize: number;
  users: Pick<Profile, 'id' | 'username' | 'avatarUrl' | 'isStaff'>[];
};

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
  avatarUploading.value = true;
  doFetchPut('/api/account/avatar', file)
    .then((response) => {
      if (response.ok) {
        console.log('avatar updated');
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
        console.log('avatar deleted');
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
  if (!appStore.logined) {
    await router.push(localePath('/login'));
    return;
  }
  followLoading.value = true;
  const target = encodeURIComponent(user.value.username);
  const request = user.value.followedByMe
    ? doFetchDelete(`/api/account/following/${target}`)
    : doFetchPut(`/api/account/following/${target}`, {});
  try {
    const response = await request;
    if (!response.ok) {
      await Promise.reject(response);
    }
    const updated: Profile = await response.json();
    user.value.followers = updated.followers;
    user.value.following = updated.following;
    user.value.followingProjects = updated.followingProjects;
    user.value.followedByMe = updated.followedByMe;
    toast.success(
      updated.followedByMe ? t('profile.followed') : t('profile.unfollowed'),
      { duration: 1800 },
    );
  } catch (e) {
    await toastError(e, t('profile.follow_failed'));
  } finally {
    followLoading.value = false;
  }
}

async function openFollowList(kind: 'followers' | 'following') {
  if (!user.value) return;
  if (kind === 'followers' && !canOpenFollowers.value) return;
  if (kind === 'following' && !canOpenFollowing.value) return;

  followDialog.value = true;
  followDialogTitle.value = t(
    kind === 'followers'
      ? isSelf.value
        ? 'profile.my_followers'
        : 'common.followers'
      : 'profile.following_list',
  );
  listLoading.value = true;
  followUsers.value = [];
  followDialogTotal.value = 0;

  const endpoint =
    kind === 'followers'
      ? isSelf.value
        ? '/api/account/followers'
        : `/api/users/${encodeURIComponent(user.value.username)}/followers`
      : isSelf.value
        ? '/api/account/following'
        : `/api/users/${encodeURIComponent(user.value.username)}/following`;

  try {
    const response = await doFetchGet(endpoint, { page: '1', pageSize: '50' });
    if (!response.ok) {
      await Promise.reject(response);
    }
    const data: FollowListResponse = await response.json();
    followUsers.value = data.users;
    followDialogTotal.value = data.total;
  } catch (e) {
    followDialog.value = false;
    await toastError(e, t('profile.follow_list_failed'));
  } finally {
    listLoading.value = false;
  }
}
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
      <div v-if="canToggleFollow" class="follow-action">
        <v-btn
          :color="user?.followedByMe ? undefined : 'primary'"
          :loading="followLoading"
          :prepend-icon="
            user?.followedByMe ? 'mdi-account-check' : 'mdi-account-plus'
          "
          block
          rounded="lg"
          variant="tonal"
          @click="toggleFollow"
        >
          {{
            user?.followedByMe ? $t('profile.unfollow') : $t('profile.follow')
          }}
        </v-btn>
      </div>
      <div v-if="canAdminEditUser && user" class="admin-edit-action">
        <v-dialog
          v-model="adminEditDialog"
          max-width="500"
          :persistent="adminEditDirty"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              block
              class="text-capitalize"
              color="primary"
              prepend-icon="mdi-account-edit"
              rounded="lg"
              variant="tonal"
            >
              {{ $t('common.edit') }} (Admin)
            </v-btn>
          </template>
          <AdminEditUserDialogContent
            :item="user"
            @close="adminEditDialog = false"
            @update:dirty="adminEditDirty = $event"
          />
        </v-dialog>
      </div>

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

      <!-- followers and following and following projects -->
      <div class="profile-stats">
        <button
          class="profile-stat"
          :class="{ 'is-static': !canOpenFollowers }"
          :disabled="!canOpenFollowers"
          type="button"
          @click="openFollowList('followers')"
        >
          <span class="profile-stat-number">{{ user?.followers || 0 }}</span>
          <span class="profile-stat-label">
            <v-icon size="16">mdi-account-group</v-icon>
            <span>{{ $t('common.followers') }}</span>
          </span>
        </button>
        <button
          class="profile-stat"
          type="button"
          @click="openFollowList('following')"
        >
          <span class="profile-stat-number">{{ user?.following || 0 }}</span>
          <span class="profile-stat-label">
            <v-icon size="16">mdi-account-group-outline</v-icon>
            <span>{{ $t('common.following') }}</span>
          </span>
        </button>
        <div class="profile-stat is-static">
          <span class="profile-stat-number">{{
            user?.followingProjects || 0
          }}</span>
          <span class="profile-stat-label">
            <v-icon size="16">mdi-source-branch</v-icon>
            <span>{{ $t('common.following_projects') }}</span>
          </span>
        </div>
      </div>
      <slot name="actions" />
    </div>
    <v-dialog v-model="followDialog" max-width="420">
      <v-card class="follow-dialog" rounded="lg">
        <v-card-title class="follow-dialog-title">
          <v-icon>mdi-account-multiple</v-icon>
          <span>{{ followDialogTitle }}</span>
          <v-chip size="small" variant="tonal">{{ followDialogTotal }}</v-chip>
        </v-card-title>
        <v-card-text>
          <v-skeleton-loader v-if="listLoading" type="list-item-avatar@4" />
          <template v-else>
            <v-list v-if="followUsers.length" density="comfortable">
              <v-list-item
                v-for="item in followUsers"
                :key="item.id"
                :to="localePath(`/@${item.username}`)"
                rounded="lg"
              >
                <template #prepend>
                  <v-avatar :image="item.avatarUrl" size="36" />
                </template>
                <v-list-item-title>
                  {{ item.username }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
            <div v-else class="empty-follow-list">
              {{ $t('profile.no_follow_users') }}
            </div>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>
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

.follow-action {
  margin: 12px 0;
}

.admin-edit-action {
  margin: 12px 0;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.profile-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70px;
  width: 100%;
  min-width: 0;
  padding: 9px 4px;
  color: inherit;
  background: rgba(var(--v-theme-on-surface), 0.045);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 10px;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;
}

.profile-stat:not(.is-static) {
  cursor: pointer;
}

.profile-stat:not(.is-static):hover {
  background: rgba(var(--v-theme-primary), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.34);
  transform: translateY(-1px);
}

.profile-stat:disabled {
  opacity: 1;
}

.profile-stat-number {
  font-size: 1.58rem;
  font-weight: 800;
  line-height: 1.05;
}

.profile-stat-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  max-width: 100%;
  margin-top: 6px;
  overflow: hidden;
  font-size: 0.72rem;
  line-height: 1.15;
  opacity: 0.68;
  text-align: center;
}

.profile-stat.is-static {
  cursor: default;
}

.follow-dialog-title {
  display: flex;
  gap: 10px;
  align-items: center;
}

.empty-follow-list {
  padding: 28px 0;
  opacity: 0.62;
  text-align: center;
}
</style>
