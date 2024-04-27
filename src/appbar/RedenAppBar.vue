<script setup lang="ts">
import SearchButton from './SearchButton.vue';
import TranslateButton from './TranslateButton.vue';
import '@/main.css';
import AccountButton from '@/appbar/AccountButton.vue';
import { discordInvite, githubLink, theme } from '@/constants';
import { useAppStore } from '@/store/app';
import { useDisplay } from 'vuetify';

const { mobile } = useDisplay();
function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  useAppStore().setTheme(theme.value);
}
</script>

<template>
  <v-app-bar :elevation="2" color="transparent" class="reden-app-bar">
    <template #prepend>
      <v-menu v-show="mobile" :close-on-content-click="true">
        <template #activator="{ props }">
          <v-btn
            class="mobile-show"
            icon="mdi-menu"
            title="Menu"
            v-bind="props"
          />
        </template>

        <v-list class="w-100">
          <v-list-item href="/">
            <template #prepend>
              <v-icon>mdi-home</v-icon>
            </template>
            <v-list-item-title> Home </v-list-item-title>
          </v-list-item>
          <v-list-item href="/feature">
            <template #prepend>
              <v-icon>mdi-view-dashboard</v-icon>
            </template>
            <v-list-item-title> Features </v-list-item-title>
          </v-list-item>
          <v-divider />
          <template v-if="useAppStore().logined">
            <router-link to="/home">
              <v-list-item>
                <template #prepend>
                  <v-avatar
                    v-if="useAppStore().userCache?.avatarUrl"
                    :size="40"
                    :image="useAppStore().userCache?.avatarUrl"
                  />
                  <v-icon v-else> mdi-account</v-icon>
                </template>
                <v-list-item-title> My Profile </v-list-item-title>
              </v-list-item>
            </router-link>
            <v-list-item>
              <v-list-item-title> My Machines </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title> My Stars </v-list-item-title>
            </v-list-item>
          </template>
          <template v-else>
            <v-list-item href="/login">
              <template #prepend>
                <v-icon>mdi-account</v-icon>
              </template>
              <v-list-item-title> Login </v-list-item-title>
            </v-list-item>
            <v-list-item href="/register">
              <template #prepend>
                <v-icon>mdi-account-plus</v-icon>
              </template>
              <v-list-item-title> Register </v-list-item-title>
            </v-list-item>
          </template>
          <template v-if="useAppStore().userCache?.isStaff">
            <v-divider />
            <router-link to="/admin/users">
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-cog</v-icon>
                </template>
                <v-list-item-title> Admin </v-list-item-title>
              </v-list-item>
            </router-link>
          </template>
        </v-list>
      </v-menu>
      <v-btn v-show="!mobile" icon="mdi-home" title="Home" href="/" />
    </template>
    <p class="text-h5"></p>
    <template #append>
      <v-btn
        class="mobile-hide"
        icon="mdi-github"
        title="Github"
        :href="githubLink"
      />
      <v-btn
        class="mobile-hide"
        icon="custom:DiscordIcon"
        title="Discord"
        :href="discordInvite"
      />
      <v-btn
        :icon="theme === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'"
        @click="toggleTheme"
        title="Toggle Theme"
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
