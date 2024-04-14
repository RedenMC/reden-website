<script setup lang="ts">
import '@/main.css';
//import SearchButton from './SearchButton.vue';
import TranslateButton from './TranslateButton.vue';
import AccountButton from '@/appbar/AccountButton.vue';
import { discordInvite, githubLink, theme } from '@/constants';
import { useAppStore } from '@/store/app';
import { useDisplay } from 'vuetify';

const { xs } = useDisplay();
function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  useAppStore().setTheme(theme.value);
}
</script>
<template>
  <v-app-bar :elevation="2" class="reden-app-bar">
    <template #prepend>
      <v-btn title="Home" href="/" class="custom-height" style="display: flex">
        <img src="../../public/Reden.png" alt="Reden" width="40" height="40" style="image-rendering: pixelated;" />
        <span class="text-h4 font-weight-bold">Reden</span>
      </v-btn>
      <v-btn
        title="Download"
        href="/download"
        icon="mdi-download"
      >
      </v-btn>
    </template>
    <template #append>
        <v-btn v-if="!xs"
          icon="mdi-github"
          title="Github"
          :href="githubLink"
        />
        <v-btn v-if="!xs"
          icon="custom:DiscordIcon"
          title="Discord"
          :href="discordInvite"
        />
        <v-btn v-if="!xs"
          :icon="theme === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'"
          title="Toggle Theme"
          @click="toggleTheme"
        />
        <TranslateButton/>
        <!-- <search-button /> 存在的必要?-->
        <AccountButton v-if="!xs"/>
      <v-menu v-show="xs" class="xs-show" v-if="xs">
        <template #activator="{ props }">
          <v-btn
            icon="mdi-menu"
            title="Menu"
            v-bind="props"
          />
        </template>
        <v-list class="w-100">
          <v-list-item :href="useAppStore().logined ? '/home' : '/login'">
            <template #prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>Account</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="toggleTheme">
            <template #prepend>
              <v-icon :icon="theme === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'"/>
            </template>
            <v-list-item-title>Toggle Theme</v-list-item-title>
          </v-list-item>
          <v-list-item :href="discordInvite">
            <template #prepend>
              <div style="opacity: 0.65">
                <v-icon>custom:DiscordIcon</v-icon>
              </div>
            </template>
            <v-list-item-title  style="margin-left: 32px;">Discord</v-list-item-title>
          </v-list-item>
          <v-list-item :href="githubLink">
            <template #prepend>
              <v-icon>mdi-github</v-icon>
            </template>
            <v-list-item-title>Github</v-list-item-title>
          </v-list-item>
          <!--
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
          -->
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
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}
</style>
