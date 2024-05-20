<script lang="ts" setup>
import SearchButton from './SearchButton.vue';
import TranslateButton from './TranslateButton.vue';
import '@/main.css';
import AccountButton from '@/appbar/AccountButton.vue';
import { discordInvite, githubLink, theme } from '@/constants';
import { useAppStore } from '@/store/app';
import { useDisplay } from 'vuetify';
import RedenRouter from '@/router/RedenRouter.vue';
import { watch } from 'vue';

const { mobile } = useDisplay({
  mobileBreakpoint: 500,
});
watch(mobile, (nv) => {
  console.log(nv);
});
console.log(mobile.value);

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  useAppStore().setTheme(theme.value);
}
</script>

<template>
  <v-app-bar :elevation="2" class="reden-app-bar" color="transparent">
    <template #prepend>
      <v-menu :close-on-content-click="true">
        <template #activator="{ props }">
          <v-btn v-show="mobile" icon="mdi-menu" title="Menu" v-bind="props" />
        </template>

        <v-list class="w-100">
          <v-list-item to="/">
            <template #prepend>
              <v-icon>mdi-home</v-icon>
            </template>
            <v-list-item-title> Home </v-list-item-title>
          </v-list-item>
          <v-list-item to="/feature">
            <template #prepend>
              <v-icon>mdi-view-dashboard</v-icon>
            </template>
            <v-list-item-title> Features </v-list-item-title>
          </v-list-item>
          <v-divider />
          <template v-if="useAppStore().logined">
            <reden-router to="/home">
              <v-list-item link>
                <template #prepend>
                  <v-avatar
                    v-if="useAppStore().userCache?.avatarUrl"
                    :image="useAppStore().userCache?.avatarUrl"
                    :size="40"
                  />
                  <v-icon v-else> mdi-account</v-icon>
                </template>
                <v-list-item-title> My Profile</v-list-item-title>
              </v-list-item>
            </reden-router>
            <v-list-item>
              <v-list-item-title> My Machines</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title> My Stars</v-list-item-title>
            </v-list-item>
          </template>
          <template v-else>
            <reden-router to="/login">
              <v-list-item link>
                <template #prepend>
                  <v-icon>mdi-account</v-icon>
                </template>
                <v-list-item-title> Login</v-list-item-title>
              </v-list-item>
            </reden-router>

            <reden-router to="/register">
              <v-list-item link>
                <template #prepend>
                  <v-icon>mdi-account-plus</v-icon>
                </template>
                <v-list-item-title> Register</v-list-item-title>
              </v-list-item>
            </reden-router>
          </template>
          <template v-if="useAppStore().userCache?.isStaff">
            <v-divider />
            <reden-router to="/admin/users">
              <v-list-item link>
                <template #prepend>
                  <v-icon>mdi-cog</v-icon>
                </template>
                <v-list-item-title>Admin</v-list-item-title>
              </v-list-item>
            </reden-router>
          </template>
        </v-list>
      </v-menu>
      <v-btn v-show="!mobile" icon="mdi-home" title="Home" to="/" />
    </template>
    <p class="text-h5"></p>
    <template #append>
      <v-btn
        v-show="!mobile"
        :to="githubLink"
        icon="mdi-github"
        title="Github"
      />

      <v-btn
        v-show="!mobile"
        :to="discordInvite"
        icon="custom:DiscordIcon"
        title="Discord"
      />

      <v-btn
        :icon="theme === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'"
        title="Toggle Theme"
        @click="toggleTheme"
      />
      <TranslateButton />
      <SearchButton />
      <AccountButton />
    </template>
  </v-app-bar>
</template>

<style scoped>
.reden-app-bar {
  backdrop-filter: blur(10px);
}
</style>
