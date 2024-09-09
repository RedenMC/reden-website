<script lang="ts" setup>
import { VSonner } from 'vuetify-sonner';
import { discordInvite, githubLink } from '@/utils/constants';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDisplay, useTheme } from 'vuetify';
import { useAppStore } from '~/store/app';
const localePath = useLocalePath();
const switchLocalePath = useSwitchLocalePath();

onMounted(() => {
  // set body background color
  document.body.style.backgroundColor =
    useTheme().current.value.colors['background']!;
});

const { locale } = useI18n();
const dialogCookies = ref(false);
const appStore = useAppStore();

const { mobile } = useDisplay({
  mobileBreakpoint: 500,
});

function toggleTheme() {
  appStore.theme = appStore.theme === 'light' ? 'dark' : 'light';
  appStore.save();
}
console.log('<layout> setup()');
</script>

<template>
  <v-app :theme="appStore.theme">
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
          :icon="
            appStore.theme === 'light'
              ? 'mdi-weather-night'
              : 'mdi-weather-sunny'
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

    <VSonner :expand="true" :position="'top-right'" />
    <v-main>
      <slot />
    </v-main>

    <v-footer border class="flex-column">
      <v-row class="text-center">
        <v-col>
          <div class="footer-list-title">
            <b>
              {{ $t('reden.footer.reden_mod.title') }}
            </b>
          </div>
          <div class="footer-list-item">
            <NuxtLink :to="localePath('/')">
              {{ $t('reden.title.home') }}
            </NuxtLink>
          </div>
          <div class="footer-list-item">
            <NuxtLink :to="localePath('/download')">
              {{ $t('reden.download') }}
            </NuxtLink>
          </div>
          <div class="footer-list-item">
            <NuxtLink :to="localePath('/feature/undo')">
              {{ $t('reden.footer.reden_mod.undo_redo') }}
            </NuxtLink>
          </div>
          <div class="footer-list-item">
            <NuxtLink :to="localePath('/feature/rvc')">
              {{ $t('reden.footer.reden_mod.rvc') }}
            </NuxtLink>
          </div>
          <div class="footer-list-item">
            <NuxtLink :to="localePath('/feature/debugger')">
              {{ $t('reden.footer.reden_mod.debugger') }}
            </NuxtLink>
          </div>
        </v-col>
        <v-col>
          <div class="footer-list-title">
            <b>
              {{ $t('reden.footer.reden_ecosystem.title') }}
            </b>
          </div>
          <div class="footer-list-item">
            <a :href="githubLink"> Reden on Github</a>
          </div>
          <div class="footer-list-item">
            <a href="https://wiki.redenmc.com">
              {{ $t('reden.footer.reden_ecosystem.wiki') }}
            </a>
          </div>
          <div class="footer-list-item">
            <NuxtLink :to="localePath('/sponsors')">
              {{ $t('reden.footer.reden_ecosystem.sponsors') }}
            </NuxtLink>
          </div>
          <div class="footer-list-item">
            <a href="https://github.com/RedenMC">
              {{ $t('reden.footer.reden_ecosystem.github_organization') }}
            </a>
          </div>
        </v-col>
        <v-col>
          <div class="footer-list-title">
            <b>
              {{ $t('reden.footer.reden_community.title') }}
            </b>
          </div>
          <div class="footer-list-item">
            <NuxtLink :to="localePath('/litematica')">
              {{ $t('litematica_generator.title') }}
            </NuxtLink>
          </div>
          <div class="footer-list-item">
            <NuxtLink :to="localePath('/community-guidelines')">
              {{ $t('reden.footer.reden_community.community_guidelines') }}
            </NuxtLink>
          </div>
          <div class="footer-list-item">
            <NuxtLink :to="localePath('/community-events')">
              {{ $t('reden.footer.reden_community.community_events') }}
            </NuxtLink>
          </div>
        </v-col>
        <v-col>
          <div class="footer-list-title">
            <b>
              {{ $t('reden.footer.social.title') }}
            </b>
          </div>
          <div class="footer-list-item">
            <a :href="discordInvite">
              {{ $t('reden.footer.reden_community.discord') }}
            </a>
          </div>
          <div class="footer-list-item">
            <NuxtLink external-icon to="https://youtube.com/@zly2006">
              <v-icon icon="mdi-youtube" />
              {{ $t('reden.footer.follow_us.youtube') }}
            </NuxtLink>
          </div>
          <div class="footer-list-item">
            <NuxtLink external-icon to="https://space.bilibili.com/1545239761">
              {{ $t('reden.footer.follow_us.bilibili') }}
            </NuxtLink>
          </div>
        </v-col>
      </v-row>
      <v-row class="">
        <v-col :cols="12" class="text-center">
          <NuxtLink :to="githubLink">Reden</NuxtLink>
          and
          <NuxtLink to="https://github.com/RedenMC/reden-website"
            >this website
          </NuxtLink>
          are both free software.
          <br />
          {{ new Date().getFullYear() }} — <b>RedenMC</b>
        </v-col>
      </v-row>
      <div class="text-right last-line">
        <span class="bottom-right"> Privacy </span>
        <span class="router bottom-right">
          <v-dialog v-model="dialogCookies" max-width="500">
            <v-card>
              <v-card-title>Manage Cookies</v-card-title>
              <v-card-text> Todo... </v-card-text>
            </v-card>
          </v-dialog>
          <a href="javascript:void(0)" @click="dialogCookies = !dialogCookies"
            >Cookies</a
          >
        </span>
        <span class="bottom-right">
          <a href="https://status.redenmc.com">Status</a>
        </span>
        <a class="bottom-right">
          <v-icon>mdi-earth</v-icon>
          {{ $t(locale) }}

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
        </a>
      </div>
    </v-footer>
  </v-app>
</template>

<style scoped>
.footer-list-title {
  margin-top: 8px;
  margin-bottom: 8px;
  min-width: 200px;
  text-align: center;
  justify-content: center;
  align-items: center;
  display: flex;
}

.footer-list-item {
  margin-bottom: 8px;
}

a {
  color: inherit;
  opacity: 0.8;
  text-decoration: none;
}

a:hover {
  opacity: 1;
  transition: all 0.3s ease-in-out;
  text-decoration: underline;
}

.last-line {
}

.bottom-right {
  font-size: 0.7em;
  opacity: 0.7;
  padding: 6px;
}

.reden-app-bar {
  backdrop-filter: blur(10px);
}
</style>
