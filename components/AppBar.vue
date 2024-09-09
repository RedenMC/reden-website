<script setup lang="ts">
import { useAppStore } from '~/store/app';
import { discordInvite, githubLink, theme } from '~/utils/constants';
import { useDisplay } from 'vuetify';

const { mobile } = useDisplay({
  mobileBreakpoint: 500,
});

const appStore = useAppStore();
function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  appStore.setTheme(theme.value);
}
console.log('<app-bar> setup()');
</script>

<template>
  <v-app-bar :elevation="2" class="reden-app-bar" color="transparent">
    <template #prepend>
      <template v-if="mobile">
        <v-btn v-show="mobile" icon="mdi-menu" title="Menu">
          <v-menu :close-on-content-click="true" activator="parent">
            <v-list class="w-100">
              <v-list-item :to="localePath('/')">
                <template #prepend>
                  <v-icon>mdi-home</v-icon>
                </template>
                <v-list-item-title> Home</v-list-item-title>
              </v-list-item>
              <v-list-item :to="localePath('/feature')">
                <template #prepend>
                  <v-icon>mdi-view-dashboard</v-icon>
                </template>
                <v-list-item-title> Features</v-list-item-title>
              </v-list-item>
              <v-divider />
              <template v-if="useAppStore().logined">
                <NuxtLink :to="localePath('/home')">
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
                </NuxtLink>
                <v-list-item>
                  <v-list-item-title> My Machines</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title> My Stars</v-list-item-title>
                </v-list-item>
              </template>
              <template v-else>
                <NuxtLink :to="localePath('/login')">
                  <v-list-item link>
                    <template #prepend>
                      <v-icon>mdi-account</v-icon>
                    </template>
                    <v-list-item-title> Login</v-list-item-title>
                  </v-list-item>
                </NuxtLink>

                <NuxtLink :to="localePath('/register')">
                  <v-list-item link>
                    <template #prepend>
                      <v-icon>mdi-account-plus</v-icon>
                    </template>
                    <v-list-item-title> Register</v-list-item-title>
                  </v-list-item>
                </NuxtLink>
              </template>
              <template v-if="useAppStore().userCache?.isStaff">
                <v-divider />
                <NuxtLink :to="localePath('/admin')">
                  <v-list-item link>
                    <template #prepend>
                      <v-icon>mdi-cog</v-icon>
                    </template>
                    <v-list-item-title>Admin</v-list-item-title>
                  </v-list-item>
                </NuxtLink>
              </template>
            </v-list>
          </v-menu>
        </v-btn>
      </template>
      <template v-else>
        <v-btn stacked title="Homepage" :to="localePath('/')" :active="false">
          <v-img src="/reden_256.png" width="36" />
        </v-btn>
        <v-btn
          v-if="useAppStore().userCache?.isStaff"
          prepend-icon="mdi-cog"
          stacked
          title="Admin"
          :to="localePath('/admin')"
        >
          Admin
        </v-btn>
      </template>
    </template>
    <p class="text-h5"></p>
    <template #append>
      <v-btn
        v-show="!mobile"
        :href="githubLink"
        icon="mdi-github"
        title="Github"
      />

      <v-btn
        v-show="!mobile"
        :href="discordInvite"
        icon="custom:DiscordIcon"
        title="Discord"
      />

      <v-btn
        :icon="theme === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'"
        title="Toggle Theme"
        @click="toggleTheme"
      />
      <v-btn icon="mdi-translate" title="Language">
        <v-icon icon="mdi-translate" />
        <v-menu :close-on-content-click="true" activator="parent">
          <v-list>
            <v-list-item
              v-for="locale in $i18n.availableLocales"
              :key="`locale-${locale}`"
              :to="switchLocalePath(locale)"
            >
              <v-list-item-title>{{ $t(locale) }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
      <v-btn
        :to="useAppStore().logined ? '/home' : '/login'"
        icon="mdi-account"
        title="Account"
      />
    </template>
  </v-app-bar>
</template>

<style scoped></style>
