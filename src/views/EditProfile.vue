<script lang="ts" setup>
import {
  doFetchPost,
  fetchUser,
  isStrongPassword,
  Profile,
  toastError,
} from '@/constants';
import { ref } from 'vue';
import OAuthAccountLine from '@/components/editProfilePage/OAuthAccountLine.vue';
import { toast } from 'vuetify-sonner';

const userCopy = ref<Profile>();
const user = ref<Profile>();
fetchUser(user).then(() => {
  userCopy.value = JSON.parse(JSON.stringify(user.value));
});

const oldPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
function changePassword() {
  if (!isStrongPassword(newPassword.value)) return;
  if (newPassword.value !== confirmNewPassword.value) return;
}

const savingInfo = ref(false);
const savingPreferences = ref(false);
function saveInfo() {
  savingInfo.value = true;
  doFetchPost('/api/account/update', user.value)
    .then((response) => {
      if (response.ok) {
        toast('Success', {
          description: 'Information saved',
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
    .catch((e) => toastError(e, 'Failed to save information'))
    .finally(() => {
      savingInfo.value = false;
    });
  // backend: todo
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
        toast('Success', {
          description: 'Preferences saved',
          duration: 1000,
          cardProps: {
            color: 'green',
          },
        });
        userCopy.value!.preference = user.value?.preference!;
      } else {
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
  <v-card v-if="user" class="setting-section-card" rounded="lg">
    <h3 class="setting-section-title">Basic Information</h3>
    <v-row>
      <v-col>
        <p class="setting-label">Email</p>
        <p class="setting-description">
          This is the email you use to register and reset your password.
        </p>
      </v-col>
      <div>
        <span class="setting-button">
          {{ user.email }}
        </span>
        <v-btn class="text-capitalize setting-button" color="primary">
          Change Email
        </v-btn>
      </div>
    </v-row>
    <v-row>
      <v-col>
        <p class="setting-label">Username</p>
        <p class="setting-description">
          This is the username you use to login. You can change it once every 48
          hours.
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
            You can change your username again in
            {{
              Math.round(
                (user.canChangeNameUntil! - Date.now()) / 1000 / 60 / 60,
              )
            }}
            hours
          </template>
        </v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <p class="setting-label">Bio</p>
        <p class="setting-description">Introduction about yourself.</p>
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
        Save
      </v-btn>
    </v-row>
  </v-card>

  <v-card class="setting-section-card" rounded="lg" v-if="user">
    <h3 class="setting-section-title">Preferences</h3>
    <v-row>
      <v-col cols="9">
        <p class="setting-label">Show Email</p>
        <p class="setting-description">
          Whether to show your email to other users.
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
        <p class="setting-label">Show Minecraft Username</p>
        <p class="setting-description">
          Whether to show your Minecraft username to other users.
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
        <p class="setting-label">Show GitHub</p>
        <p class="setting-description">
          Whether to show your GitHub to other users.
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
        <p class="setting-label">Show Timezone</p>
        <p class="setting-description">
          Whether to show your timezone to other users.
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
    <v-row>
      <v-col cols="9">
        <p class="setting-label">Show QQ</p>
        <p class="setting-description">
          Whether to show your QQ to other users.
        </p>
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
        <p class="setting-label">Pronouns</p>
        <p class="setting-description">Your pronouns.</p>
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
      <v-spacer />
      <v-btn
        :loading="savingPreferences"
        class="text-capitalize setting-button"
        color="primary"
        @click="savePreferences"
        :disabled="userCopy && !changed(user.preference, userCopy!.preference)"
      >
        Save Preferences
      </v-btn>
    </v-row>
  </v-card>

  <v-card v-if="user" class="setting-section-card" rounded="lg">
    <h3 class="setting-section-title">Password</h3>
    <p>You can change your password here.</p>
    <v-text-field
      v-if="!user.passwordNotSet"
      v-model="oldPassword"
      class="setting-input"
      color="primary"
      type="password"
      label="Old Password"
      placeholder="Enter your old password"
    />
    <p v-if="user.passwordNotSet">
      This is the first time you login, please change your password as soon as
      possible.
    </p>
    <v-text-field
      v-model="newPassword"
      class="setting-input"
      color="primary"
      type="password"
      label="New Password"
      placeholder="Enter your new password"
      :rules="[
        (v: string) =>
          isStrongPassword(v) ||
          'Password must contain at least 8 characters, and include uppercase, lowercase, and numbers',
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
      label="Confirm New Password"
      placeholder="Enter your new password again"
      :rules="[(v: string) => v === newPassword || 'Passwords do not match']"
    />
    <v-row>
      <v-spacer />
      <v-btn
        class="text-capitalize setting-button"
        color="primary"
        @click="changePassword"
      >
        Change Password
      </v-btn>
    </v-row>
  </v-card>
  <v-card class="setting-section-card" rounded="lg">
    <h3 class="setting-section-title">Third Party Accounts</h3>
    <OAuthAccountLine icon="mdi-microsoft" type="microsoft" />
    <OAuthAccountLine icon="mdi-github" type="github" />
  </v-card>
</template>

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

.setting-section-card {
  margin: 20px auto;
  padding: 20px;

  max-width: 900px;
}

.setting-section-title {
  font-size: 1.5rem !important;
  font-weight: 500;
  padding: 0;
  margin: 0 0 10px;
}
</style>
