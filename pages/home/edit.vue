<script lang="ts" setup>
import {
  type Captcha,
  doFetchDelete,
  doFetchPost,
  doFetchPut,
  fetchUser,
  isStrongPassword,
  type Profile,
  resetCaptcha,
  toastError,
  zh_cn,
} from '@/utils/constants';
import { ref, watch } from 'vue';
import { toast } from 'vuetify-sonner';
import { useI18n } from 'vue-i18n';
import CommonCaptcha from '@/components/CommonCaptcha.vue';
import { useRouter } from 'vue-router';
import BindPhoneNumberCard from '~/components/profile/BindPhoneNumberCard.vue';

const bindPhoneNumberDialog = ref(false);

const uploader = ref<HTMLInputElement>();
const avatarUploading = ref(false);

function editAvatar() {
  uploader.value?.click();
}

function fileSelected() {
  const file = uploader.value?.files?.item(0);
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
        });
        // Refresh user data to show new avatar
        fetchUser(user);
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
        });
        // Refresh user data
        fetchUser(user);
      } else {
        return Promise.reject(response);
      }
    })
    .catch((e) => toastError(e, 'Failed to delete avatar'));
}

const router = useRouter();
const localePath = useLocalePath();

const { locale } = useI18n();
const mockUser: Profile = {
  avatarUrl: '',
  email: '',
  id: 0,
  passwordNotSet: false,
  preference: {
    showQQ: false,
    showEmail: false,
    showMC: false,
    showGithub: false,
    showTimezone: false,
    timezone: 'GMT',
  },
  roles: [],
  username: '',
};
/**
 * use instance before modification.
 */
const userCopy = ref<Profile>(mockUser);
const user = ref<Profile>(mockUser);
watch(user, () => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!user.value.preference.timezone) {
    console.log(`user updated, auto add timezone ${timeZone}`);
    user.value.preference.timezone = timeZone;
    doFetchPost('/api/account/update/preference', user.value.preference);
  }
});
const dialogChangePassword = ref(
  router.currentRoute.value?.hash === '#change-password',
);
const { t } = useI18n();
useHead({
  title: t('reden.title.edit_profile'),
  titleTemplate: '%s - Reden',
});
definePageMeta({
  needLogin: true,
});
const {
  data: oauthData,
  status: oauthLoading,
  refresh: refreshOAuth,
} = useFetch<OAuthAccount[]>('/api/account/oauth');

if (import.meta.client) {
  refreshOAuth();
}

function getOAuthAccount(type: string) {
  return oauthData.value?.find((a) => a.type === type);
}

async function unlinkAccount(type: string) {
  let response = await doFetchDelete(`/api/account/${type}`);
  if (response.ok) {
    await refreshOAuth();
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
}

watch(dialogChangePassword, () => {
  if (dialogChangePassword.value) {
    router.replace({
      hash: '#change-password',
    });
  } else {
    router.replace({
      hash: '',
    });
  }
});
if (import.meta.client) {
  fetchUser(user).then(() => {
    userCopy.value = JSON.parse(JSON.stringify(user.value));
  });
}

const timezones = Intl.supportedValuesOf('timeZone');

const oldPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const changingPassword = ref(false);
const captcha = ref<Captcha>();

function changePassword() {
  if (!isStrongPassword(newPassword.value)) return;
  if (newPassword.value !== confirmNewPassword.value) return;
  if (!captcha.value?.token) return;
  const body = {
    oldPassword: oldPassword.value,
    newPassword: newPassword.value,
    captcha: captcha.value,
  };
  changingPassword.value = true;
  resetCaptcha();
  doFetchPost('/api/account/security/change-password', body)
    .then((response) => {
      if (response.ok) {
        toast.success(t('profile.edit.success'), {
          description: 'Password Updated',
          duration: 1000,
        });
        fetchUser(user).then(() => {
          oldPassword.value = '';
          newPassword.value = '';
          confirmNewPassword.value = '';
        });
      } else {
        resetCaptcha();
        return Promise.reject(response);
      }
    })
    .catch((e) => toastError(e, 'Failed to change password.'))
    .finally(() => {
      changingPassword.value = false;
    });
}

const savingInfo = ref(false);
const savingPreferences = ref(false);

async function saveInfo() {
  savingInfo.value = true;
  const response = await doFetchPost('/api/account/update', user.value);
  if (response.ok) {
    toast.success(t('profile.edit.success'), {
      description: t('profile.edit.information_saved'),
      duration: 1000,
    });
    fetchUser(user).then(() => {
      userCopy.value = JSON.parse(JSON.stringify(user.value));
    });
  } else {
    await toastError(response, t('profile.edit.failed_to_save_information'));
  }
  savingInfo.value = false;
}

function changed(a: Record<string, unknown>, b: Record<string, unknown>) {
  return Object.keys(a).some((key: string) => a[key] !== b[key]);
}

function savePreferences() {
  savingPreferences.value = true;
  if (!user.value?.preference) return;
  doFetchPost('/api/account/update/preference', user.value?.preference)
    .then((response) => {
      if (response.ok) {
        toast.success(t('profile.edit.success'), {
          description: t('profile.edit.preferencesSaved'),
          duration: 1000,
        });
        userCopy.value!.preference = JSON.parse(
          JSON.stringify(user.value?.preference),
        );
      } else {
        resetCaptcha();
        return Promise.reject(response);
      }
    })
    .catch((e) => {
      toast('Error', {
        description: e.toString(),
        duration: 3e3,
        cardProps: {
          color: 'error',
        },
      });
    })
    .finally(() => {
      savingPreferences.value = false;
    });
}
</script>

<template>
  <div>
    <div class="section">
      <v-btn
        :to="localePath('/home')"
        class="text-capitalize"
        color="primary"
        prepend-icon="mdi-arrow-left"
        variant="outlined"
      >
        {{ t('profile.edit.back') }}
      </v-btn>
      <h1>
        {{ t('reden.title.edit_profile') }}
      </h1>
    </div>
    <v-card border class="setting-section-card section" rounded="lg">
      <h3 class="setting-section-title">{{ t('profile.edit.avatar_title') }}</h3>
      <v-row>
        <v-col>
          <p class="setting-label">Avatar</p>
          <p class="setting-description">{{ t('profile.edit.avatar_desc') }}</p>
        </v-col>
        <v-col>
          <div class="d-flex justify-center flex-row align-center">
            <v-avatar :image="user.avatarUrl" size="56"></v-avatar>
            <div class="d-flex mt-2">
              <v-btn @click="editAvatar" color="primary" class="text-capitalize">
                <v-icon>mdi-pencil</v-icon>
                {{ t('common.edit') }}
              </v-btn>
              <v-btn
                v-if="user.avatarUrl"
                @click="deleteAvatar"
                color="error"
                class="text-capitalize"
              >
                <v-icon>mdi-delete</v-icon>
                {{ t('common.delete') }}
              </v-btn>
            </div>
          </div>
          <input
            ref="uploader"
            accept="image/*"
            class="d-none"
            type="file"
            @change="fileSelected"
          />
        </v-col>
      </v-row>
    </v-card>
    <v-card
      v-if="user"
      border
      class="setting-section-card section"
      rounded="lg"
    >
      <h3 class="setting-section-title">
        {{ t('profile.edit.basic_information') }}
      </h3>
      <v-row>
        <v-col>
          <p class="setting-label">Email</p>
          <p class="setting-description">
            {{ t('profile.edit.email_desc') }}
          </p>
        </v-col>
        <div>
          <span class="setting-button">
            {{ user.email }}
          </span>
          <v-btn class="text-capitalize setting-button" color="primary">
            {{ t('profile.edit.changeEmail') }}
          </v-btn>
        </div>
      </v-row>
      <v-row>
        <v-col>
          <p class="setting-label">Phone Number</p>
          <p class="setting-description">{{ t('profile.edit.phone_number_desc') }}</p>
        </v-col>
        <div>
          <span class="setting-button" v-if="user.phoneNumber">
            {{ user.phoneNumber }}
          </span>
          <v-dialog v-model="bindPhoneNumberDialog" max-width="800px">
            <template v-slot:activator="{ props }">
              <v-btn
                class="text-capitalize setting-button"
                color="primary"
                v-bind="props"
              >
                {{ user.phoneNumber ? 'Change' : 'Bind' }}
              </v-btn>
            </template>
            <BindPhoneNumberCard
              @close="
                bindPhoneNumberDialog = false;
                fetchUser(user);
              "
            />
          </v-dialog>
        </div>
      </v-row>
      <v-row>
        <v-col>
          <p class="setting-label">{{ t('profile.edit.username') }}</p>
          <p class="setting-description">
            {{ t('profile.edit.username_desc') }}
          </p>
        </v-col>
        <v-col>
          <v-text-field
            v-model="user.username"
            :disabled="(user.canChangeNameUntil || 0) > Date.now()"
            class="setting-input"
            color="primary"
          >
            <template #prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <template
              v-if="(user.canChangeNameUntil || 0) > Date.now()"
              #details
            >
              {{
                t('profile.edit.username_timer', [
                  Math.round(
                    (user.canChangeNameUntil! - Date.now()) / 1000 / 60 / 60,
                  ),
                ])
              }}
            </template>
          </v-text-field>
        </v-col>
      </v-row>
      <v-row v-if="locale === 'zh_cn'">
        <v-col>
          <p class="setting-label">实名认证</p>
          <p class="setting-description">
            仅针对中国大陆用户，未经实名认证的用户和非中国公民用户的评论、发帖等，对于中国大陆用户隐藏。
            <router-link class="router" to="/zh_cn/docs/real-person">
              了解更多
            </router-link>
          </p>
        </v-col>
        <v-col>
          <v-btn
            class="text-capitalize setting-button"
            color="primary"
            disabled
            variant="outlined"
          >
            {{ user.realName ? '已认证' : '未认证' }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <p class="setting-label">{{ t('profile.edit.bio') }}</p>
          <p class="setting-description">{{ t('profile.edit.bio_desc') }}</p>
        </v-col>
        <v-col>
          <v-textarea v-model="user.bio" class="setting-input" color="primary">
          </v-textarea>
        </v-col>
      </v-row>

      <v-row>
        <v-spacer />
        <v-btn
          :disabled="
            userCopy?.username == user.username &&
            (userCopy?.bio || '') == user.bio
          "
          :loading="savingInfo"
          class="text-capitalize setting-button"
          color="primary"
          @click="saveInfo"
        >
          {{ t('profile.edit.save') }}
        </v-btn>
      </v-row>
    </v-card>

    <v-card border class="setting-section-card section" rounded="lg">
      <h3 class="setting-section-title">{{ t('profile.edit.preferences') }}</h3>
      <v-row>
        <v-col cols="9">
          <p class="setting-label">
            {{ t('profile.edit.preference.showEmail') }}
          </p>
          <p class="setting-description">
            {{ t('profile.edit.preference.show_email_desc') }}
          </p>
        </v-col>
        <v-spacer />
        <v-switch
          v-model="user.preference.showEmail"
          :hide-details="true"
          class="setting-button"
          color="primary"
        />
      </v-row>
      <v-row>
        <v-col cols="9">
          <p class="setting-label">
            {{ t('profile.edit.preference.show_minecraft_uuid') }}
          </p>
          <p class="setting-description">
            {{ t('profile.edit.preference.show_minecraft_uuid_desc') }}
          </p>
        </v-col>
        <v-spacer />
        <v-switch
          v-model="user.preference.showMC"
          :hide-details="true"
          class="setting-button"
          color="primary"
        />
      </v-row>
      <v-row>
        <v-col cols="9">
          <p class="setting-label">
            {{ t('profile.edit.preference.show_github') }}
          </p>
          <p class="setting-description">
            {{ t('profile.edit.preference.show_github_desc') }}
          </p>
        </v-col>
        <v-spacer />
        <v-switch
          v-model="user.preference.showGithub"
          class="setting-button"
          color="primary"
          hide-details
        />
      </v-row>
      <v-row>
        <v-col cols="9">
          <p class="setting-label">
            {{ t('profile.edit.preference.show_timezone') }}
          </p>
          <p class="setting-description">
            {{ t('profile.edit.preference.show_timezone_desc') }}
          </p>
        </v-col>
        <v-spacer />
        <v-switch
          v-model="user.preference.showTimezone"
          class="setting-button"
          color="primary"
          hide-details
        />
      </v-row>
      <v-row v-if="locale == zh_cn">
        <v-col cols="9">
          <p class="setting-label">显示 QQ</p>
          <p class="setting-description">向其他人显示你的QQ号码。</p>
        </v-col>
        <v-spacer />
        <v-switch
          v-model="user.preference.showQQ"
          class="setting-button"
          color="primary"
          hide-details
        />
      </v-row>
      <v-row>
        <v-col>
          <p class="setting-label">
            {{ t('profile.edit.preference.pronouns') }}
          </p>
          <p class="setting-description">
            {{ t('profile.edit.preference.pronouns_desc') }}
          </p>
        </v-col>
        <v-col>
          <v-text-field
            v-model="user.preference.pronouns"
            class="setting-input"
            color="primary"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <p class="setting-label">
            {{ t('profile.edit.preference.timezone') }}
          </p>
          <p class="setting-description">
            {{ t('profile.edit.preference.timezone_desc') }}
          </p>
        </v-col>
        <v-col>
          <v-select
            v-model="user.preference.timezone"
            :items="timezones"
            class="setting-input"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-spacer />
        <v-btn
          :disabled="
            userCopy && user && !changed(user.preference, userCopy.preference)
          "
          :loading="savingPreferences"
          class="text-capitalize setting-button"
          color="primary"
          @click="savePreferences"
        >
          {{ t('profile.edit.save_preferences') }}
        </v-btn>
      </v-row>
    </v-card>

    <v-card
      v-if="user"
      border
      class="setting-section-card section"
      rounded="lg"
    >
      <h3 class="setting-section-title">
        {{ t('profile.edit.password.title') }}
      </h3>
      <p>{{ t('profile.edit.password.desc') }}</p>

      <v-row>
        <v-spacer />
        <v-btn
          class="text-capitalize setting-button"
          color="primary"
          @click="dialogChangePassword = true"
        >
          {{ t('profile.edit.password.changePassword') }}
        </v-btn>
        <v-dialog
          v-model="dialogChangePassword"
          max-width="500"
          scroll-strategy="block"
        >
          <v-card>
            <v-card-title>
              {{ t('profile.edit.password.changePassword') }}
            </v-card-title>
            <v-card-text>
              <v-form>
                <input :value="user.username" autocomplete="username" hidden />
                <v-text-field
                  v-if="!user.passwordNotSet"
                  v-model="oldPassword"
                  :label="t('profile.edit.password.old')"
                  autocomplete="current-password"
                  class="setting-input"
                  color="primary"
                  type="password"
                />
                <p v-if="user.passwordNotSet">
                  {{ t('profile.edit.password.first') }}
                </p>
                <v-text-field
                  v-model="newPassword"
                  :label="t('profile.edit.password.mew')"
                  :rules="[
                    (v: string) =>
                      isStrongPassword(v) ||
                      t('profile.edit.password.requirements'),
                    (v: string) =>
                      v !== oldPassword ||
                      'New password must be different from old password',
                  ]"
                  autocomplete="new-password"
                  class="setting-input"
                  color="primary"
                  type="password"
                />
                <v-text-field
                  v-model="confirmNewPassword"
                  :label="t('profile.edit.password.confirm')"
                  :rules="[
                    (v: string) =>
                      v === newPassword ||
                      t('profile.edit.password.passwordsDoNotMatch'),
                  ]"
                  autocomplete="new-password"
                  class="setting-input"
                  color="primary"
                  type="password"
                />
              </v-form>
              <common-captcha v-model="captcha" />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                :loading="changingPassword"
                class="text-capitalize setting-button"
                color="primary"
                variant="elevated"
                @click="changePassword"
              >
                {{ t('profile.edit.password.changePassword') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </v-card>
    <v-card border class="setting-section-card section" rounded="lg">
      <h3 class="setting-section-title">
        {{ t('profile.edit.third_party_accounts') }}
      </h3>
      <v-list border>
        <v-list-item
          v-for="type in [
            {
              name: 'Microsoft',
              icon: 'custom:Microsoft',
            },
            { name: 'Github', icon: 'mdi-github' },
            { name: 'Google', icon: 'custom:Google' },
          ]"
        >
          <v-row class="line">
            <v-col>
              <v-icon v-if="type.icon">{{ type.icon }}</v-icon>
              <span class="setting-label">
                {{ type.name }}
              </span>
            </v-col>
            <v-col>
              <p v-if="getOAuthAccount(type.name)">
                {{ getOAuthAccount(type.name)?.name }}
              </p>
            </v-col>
            <v-col>
              <v-btn
                v-if="!getOAuthAccount(type.name)"
                :href="`/api/oauth/${type.name.toLowerCase()}?redirect_url=${encodeURI('/home/edit')}`"
                :loading="oauthLoading === 'pending'"
                block
                class="text-capitalize setting-button"
                color="primary"
              >
                {{ t('profile.oauth.link_account') }}
              </v-btn>
              <v-btn
                v-if="getOAuthAccount(type.name)"
                :loading="oauthLoading === 'pending'"
                block
                class="text-capitalize setting-button"
                color="error"
                @click="unlinkAccount(type.name)"
              >
                {{ t('profile.oauth.unlink_account') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<!--suppress CssUnusedSymbol -->
<style scoped>
.setting-label {
  font-size: 1.2rem;
  font-weight: 500;

  min-width: 250px;
}

.setting-input {
  min-width: 250px;
}

.setting-button {
  margin: 12px;
}

.v-card {
  margin: 20px auto !important;
  padding: 20px !important;
}

.section {
  margin: 5px auto;
  max-width: 900px;
}

.setting-section-title {
  font-size: 1.5rem !important;
  font-weight: 500;
  padding: 0;
  margin: 0 0 10px;
}
</style>
