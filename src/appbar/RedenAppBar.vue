<script setup lang="ts">
import SearchButton from './SearchButton.vue';
import TranslateButton from './TranslateButton.vue';
import '@/main.css';
import AccountButton from '@/appbar/AccountButton.vue';
import { discordInvite, theme } from '@/constants';
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
      <v-btn title="Home" href="/" class="custom-height">
        <img src="../../public/favicon.ico" alt="Reden" />
        <span class="text-h4 font-weight-bold">Reden</span>
      </v-btn>
      <v-btn
        title="Download"
        href="/download"
        class="main-button"
        prepend-icon="mdi-download"
      >
      </v-btn>
    </template>
    <template #append>
      <v-btn
        :icon="theme === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'"
        @click="toggleTheme"
        title="Toggle Theme"
      />
      <search-button />
      <AccountButton />
      <v-menu :close-on-content-click="true">
        <template #activator="{ props }">
          <v-btn
            icon="mdi-menu"
            title="Menu"
            v-bind="props"
          />
        </template>
        <v-list class="w-100">
          <v-list-item href="/feature">
            <template #prepend>
              <v-icon>mdi-view-dashboard</v-icon>
            </template>
            <v-list-item-title> Features </v-list-item-title>
          </v-list-item>
          <v-divider />
          <template v-if="useAppStore().logined">
            <v-list-item href="/home">
              <template #prepend>
                <v-avatar
                  v-if="useAppStore().userCache?.avatarUrl"
                  :size="40"
                  :image="useAppStore().userCache?.avatarUrl || ''"
                />
                <v-icon v-else> mdi-account</v-icon>
              </template>
              <v-list-item-title> My Profile </v-list-item-title>
            </v-list-item>
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
            <v-list-item href="/admin/users">
              <template #prepend>
                <v-icon>mdi-cog</v-icon>
              </template>
              <v-list-item-title> Admin </v-list-item-title>
            </v-list-item>
          </template>
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>
</template>

<style scoped>
.reden-app-bar {
  backdrop-filter: blur(10px);
}
</style>
