<script lang="ts" setup>
import {
  type Captcha,
  doFetchPost,
  fetchUser,
  isStrongPassword,
  type Profile,
  resetCaptcha,
  toastError,
} from '@/utils/constants';
import { ref, watch } from 'vue';
import OAuthAccountLine from '@/components/editProfilePage/OAuthAccountLine.vue';
import { toast } from 'vuetify-sonner';
import { useI18n } from 'vue-i18n';
const router = useRouter();
const localePath = useLocalePath();
import CommonCaptcha from '@/components/CommonCaptcha.vue';
import { useRouter } from 'vue-router';

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
const dialogChangePassword = ref(
  router.currentRoute.value?.hash === '#change-password',
);
definePageMeta({
  title: 'reden.title.edit_profile',
});

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
        toast(t('profile.edit.success'), {
          description: 'Password Updated',
          duration: 1000,
          cardProps: {
            color: 'green',
          },
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

const { t } = useI18n();
const savingInfo = ref(false);
const savingPreferences = ref(false);
function saveInfo() {
  savingInfo.value = true;
  doFetchPost('/api/account/update', user.value)
    .then((response) => {
      if (response.ok) {
        toast(t('profile.edit.success'), {
          description: t('profile.edit.information_saved'),
          duration: 1000,
          cardProps: {
            color: 'green',
          },
        });
        fetchUser(user).then(() => {
          userCopy.value = JSON.parse(JSON.stringify(user.value));
        });
      } else {
        return Promise.reject(response);
      }
    })
    .catch((e) => toastError(e, t('profile.edit.failed_to_save_information')))
    .finally(() => {
      savingInfo.value = false;
    });
}
function changed(a: Record<string, unknown>, b: Record<string, unknown>) {
  console.log('comparing', a, 'and', b);
  return Object.keys(a).some((key: string) => a[key] !== b[key]);
}
function savePreferences() {
  savingPreferences.value = true;
  if (!user.value?.preference) return;
  doFetchPost('/api/account/update/preference', user.value?.preference)
    .then((response) => {
      if (response.ok) {
        toast(t('profile.edit.success'), {
          description: t('profile.edit.preferencesSaved'),
          duration: 1000,
          cardProps: {
            color: 'green',
          },
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
  <div class="section">
    <v-btn
      :to="localePath('/home')"
      variant="outlined"
      class="text-capitalize"
      color="primary"
      prepend-icon="mdi-arrow-left"
    >
      {{ $t('profile.edit.back') }}
    </v-btn>
    <h1>
      {{ $t('reden.title.edit_profile') }}
    </h1>
  </div>
  <v-card v-if="user" class="setting-section-card section" rounded="lg" border>
    <h3 class="setting-section-title">
      {{ $t('profile.edit.basic_information') }}
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
        <p class="setting-label">{{ t('profile.edit.username') }}</p>
        <p class="setting-description">
          {{ t('profile.edit.username_desc') }}
        </p>
      </v-col>
      <v-col>
        <v-text-field
          v-model="user.username"
          class="setting-input"
          color="primary"
          :disabled="(user.canChangeNameUntil || 0) > Date.now()"
        >
          <template #prepend>
            <v-icon>mdi-account</v-icon>
          </template>
          <template #details v-if="(user.canChangeNameUntil || 0) > Date.now()">
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
        class="text-capitalize setting-button"
        color="primary"
        :loading="savingInfo"
        @click="saveInfo"
        :disabled="
          userCopy?.username == user.username &&
          (userCopy?.bio || '') == user.bio
        "
      >
        {{ t('profile.edit.save') }}
      </v-btn>
    </v-row>
  </v-card>

  <v-card class="setting-section-card section" rounded="lg" border>
    <h3 class="setting-section-title">{{ t('profile.edit.preferences') }}</h3>
    <v-row>
      <v-col cols="9">
        <p class="setting-label">
          {{ t('profile.edit.preference.showEmail') }}
        </p>
        <p class="setting-description">
          {{ $t('profile.edit.preference.show_email_desc') }}
        </p>
      </v-col>
      <v-spacer />
      <v-switch
        class="setting-button"
        color="primary"
        v-model="user.preference.showEmail"
        :hide-details="true"
      />
    </v-row>
    <v-row>
      <v-col cols="9">
        <p class="setting-label">
          {{ t('profile.edit.preference.show_minecraft_uuid') }}
        </p>
        <p class="setting-description">
          {{ $t('profile.edit.preference.show_minecraft_uuid_desc') }}
        </p>
      </v-col>
      <v-spacer />
      <v-switch
        class="setting-button"
        color="primary"
        v-model="user.preference.showMC"
        :hide-details="true"
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
        class="setting-button"
        color="primary"
        v-model="user.preference.showGithub"
        hide-details
      />
    </v-row>
    <v-row>
      <v-col cols="9">
        <p class="setting-label">
          {{ t('profile.edit.preference.show_timezone') }}
        </p>
        <p class="setting-description">
          {{ $t('profile.edit.preference.show_timezone_desc') }}
        </p>
      </v-col>
      <v-spacer />
      <v-switch
        class="setting-button"
        color="primary"
        v-model="user.preference.showTimezone"
        hide-details
      />
    </v-row>
    <v-row v-if="locale == 'zh_cn'">
      <v-col cols="9">
        <p class="setting-label">显示 QQ</p>
        <p class="setting-description">向其他人显示你的QQ号码。</p>
      </v-col>
      <v-spacer />
      <v-switch
        class="setting-button"
        color="primary"
        v-model="user.preference.showQQ"
        hide-details
      />
    </v-row>
    <v-row>
      <v-col>
        <p class="setting-label">{{ t('profile.edit.preference.pronouns') }}</p>
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
          {{ $t('profile.edit.preference.timezone') }}
        </p>
        <p class="setting-description">
          {{ $t('profile.edit.preference.timezone_desc') }}
        </p>
      </v-col>
      <v-col>
        <v-select
          class="setting-input"
          v-model="user.preference.timezone"
          :items="timezones"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-spacer />
      <v-btn
        :loading="savingPreferences"
        class="text-capitalize setting-button"
        color="primary"
        @click="savePreferences"
        :disabled="
          userCopy && user && !changed(user.preference, userCopy.preference)
        "
      >
        {{ t('profile.edit.save_preferences') }}
      </v-btn>
    </v-row>
  </v-card>

  <v-card v-if="user" class="setting-section-card section" rounded="lg" border>
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
        scroll-strategy="block"
        max-width="500"
      >
        <v-card>
          <v-card-title>
            {{ t('profile.edit.password.changePassword') }}
          </v-card-title>
          <v-card-text>
            <v-form>
              <input autocomplete="username" :value="user.username" hidden />
              <v-text-field
                v-if="!user.passwordNotSet"
                v-model="oldPassword"
                class="setting-input"
                color="primary"
                type="password"
                autocomplete="current-password"
                :label="t('profile.edit.password.old')"
              />
              <p v-if="user.passwordNotSet">
                {{ t('profile.edit.password.first') }}
              </p>
              <v-text-field
                v-model="newPassword"
                class="setting-input"
                color="primary"
                type="password"
                autocomplete="new-password"
                :label="t('profile.edit.password.mew')"
                :rules="[
                  (v: string) =>
                    isStrongPassword(v) ||
                    t('profile.edit.password.requirements'),
                  (v: string) =>
                    v !== oldPassword ||
                    'New password must be different from old password',
                ]"
              />
              <v-text-field
                v-model="confirmNewPassword"
                class="setting-input"
                color="primary"
                type="password"
                autocomplete="new-password"
                :label="t('profile.edit.password.confirm')"
                :rules="[
                  (v: string) =>
                    v === newPassword ||
                    t('profile.edit.password.passwordsDoNotMatch'),
                ]"
              />
            </v-form>
            <common-captcha v-model="captcha" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              class="text-capitalize setting-button"
              color="primary"
              variant="elevated"
              :loading="changingPassword"
              @click="changePassword"
            >
              {{ t('profile.edit.password.changePassword') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-card>
  <v-card class="setting-section-card section" rounded="lg" border>
    <h3 class="setting-section-title">
      {{ $t('profile.edit.third_party_accounts') }}
    </h3>
    <OAuthAccountLine icon="mdi-microsoft" type="microsoft" />
    <OAuthAccountLine icon="mdi-github" type="github" />
  </v-card>
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
