<script lang="ts" setup>
import { useAppStore } from '~/store/app';
import { discordInvite, githubLink } from '~/utils/constants';
import { useDisplay, useTheme } from 'vuetify';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const theme = useTheme();
const currentTheme = computed(() => theme.current.value);
const appStore = useAppStore();
const localePath = useLocalePath();
const switchLocalePath = useSwitchLocalePath();

onMounted(() => {
  // set body background color
  const colors: Record<string, string> =
    theme.themes.value[appStore.theme]!.colors;
  const css: string[] = [];
  let themeText = `theme: ${theme.name.value}\n`;
  for (const key in colors) {
    themeText += `%c${key} %c${colors[key]}`;
    css.push('color:unset;');
    css.push(`background:${colors[key]}`);
  }
  console.log(themeText, ...css);
});
watch(currentTheme, (theme) => {
  document.body.style.backgroundColor = theme.colors.background;
  console.log(document.body.style.backgroundColor);
});

const { locale } = useI18n();

const { mobile } = useDisplay({
  mobileBreakpoint: 500,
});

function toggleTheme() {
  appStore.theme = appStore.theme === 'light' ? 'dark' : 'light';
  appStore.save();
}
</script>

<template>
  <v-app-bar :elevation="2" class="reden-app-bar" color="transparent">
    <template #prepend>
      <template v-if="mobile">
        <v-btn v-show="mobile" icon="mdi-menu" title="Menu">
          <v-icon>mdi-menu</v-icon>
          <v-menu :close-on-content-click="true" activator="parent">
            <v-list class="w-100 router">
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
                <v-list-item :to="localePath('/home')" link>
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
                <v-list-item>
                  <v-list-item-title> My Machines</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title> My Stars</v-list-item-title>
                </v-list-item>
              </template>
              <template v-else>
                <v-list-item :to="localePath('/login')" link>
                  <template #prepend>
                    <v-icon>mdi-account</v-icon>
                  </template>
                  <v-list-item-title> Login</v-list-item-title>
                </v-list-item>
                <v-list-item :to="localePath('/register')" link>
                  <template #prepend>
                    <v-icon>mdi-account-plus</v-icon>
                  </template>
                  <v-list-item-title> Register</v-list-item-title>
                </v-list-item>
              </template>
              <template v-if="useAppStore().userCache?.isStaff">
                <v-divider />
                <v-list-item :to="localePath('/admin')" link>
                  <template #prepend>
                    <v-icon>mdi-cog</v-icon>
                  </template>
                  <v-list-item-title>Admin</v-list-item-title>
                </v-list-item>
              </template>
            </v-list>
          </v-menu>
        </v-btn>
      </template>
      <template v-else>
        <v-btn :active="false" :to="localePath('/')" stacked title="Homepage">
          <v-img src="/reden_256.png" width="36" />
        </v-btn>
        <v-btn
          v-if="useAppStore().userCache?.isStaff"
          :to="localePath('/admin')"
          prepend-icon="mdi-cog"
          stacked
          title="Admin"
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
        :icon="
          appStore.theme === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'
        "
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
        :to="localePath(useAppStore().logined ? '/home' : '/login')"
        icon="mdi-account"
        title="Account"
      />
    </template>
  </v-app-bar>
</template>

<style scoped>
.reden-app-bar {
  backdrop-filter: blur(10px);
}
</style>
