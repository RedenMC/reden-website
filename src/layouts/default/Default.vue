<script lang="ts" setup>
import DefaultView from './View.vue';
import RedenAppBar from '@/appbar/RedenAppBar.vue';
import { VSonner } from 'vuetify-sonner';
import { discordInvite, githubLink, theme } from '@/constants';
import { onMounted, ref } from 'vue';
import vuetify from '@/plugins/vuetify';
import RedenRouter from '@/router/RedenRouter.vue';
import { useI18n } from 'vue-i18n';

onMounted(() => {
  // set body background color
  document.body.style.backgroundColor =
    vuetify.theme.themes.value[theme.value].colors['background']!;
});

const { locale } = useI18n();
const dialogCookies = ref(false);
</script>

<template>
  <v-app :theme="theme">
    <RedenAppBar />

    <VSonner :expand="true" :position="'top-right'" />
    <default-view />

    <v-footer border class="flex-column">
      <v-row class="text-center">
        <v-col>
          <div class="footer-list-title">
            <b>
              {{ $t('reden.footer.reden_mod.title') }}
            </b>
          </div>
          <div class="footer-list-item">
            <reden-router to="/">
              {{ $t('reden.title.home') }}
            </reden-router>
          </div>
          <div class="footer-list-item">
            <reden-router to="/download">
              {{ $t('reden.download') }}
            </reden-router>
          </div>
          <div class="footer-list-item">
            <reden-router to="/feature/undo">
              {{ $t('reden.footer.reden_mod.undo_redo') }}
            </reden-router>
          </div>
          <div class="footer-list-item">
            <reden-router to="/feature/rvc">
              {{ $t('reden.footer.reden_mod.rvc') }}
            </reden-router>
          </div>
          <div class="footer-list-item">
            <reden-router to="/feature/debugger">
              {{ $t('reden.footer.reden_mod.debugger') }}
            </reden-router>
          </div>
        </v-col>
        <v-col>
          <div class="footer-list-title">
            <b>
              {{ $t('reden.footer.reden_ecosystem.title') }}
            </b>
          </div>
          <div class="footer-list-item">
            <reden-router :to="githubLink"> Reden on Github</reden-router>
          </div>
          <div class="footer-list-item">
            <reden-router to="https://wiki.redenmc.com">
              {{ $t('reden.footer.reden_ecosystem.wiki') }}
            </reden-router>
          </div>
          <div class="footer-list-item">
            <reden-router to="/sponsors">
              {{ $t('reden.footer.reden_ecosystem.sponsors') }}
            </reden-router>
          </div>
          <div class="footer-list-item">
            <reden-router to="https://github.com/RedenMC">
              {{ $t('reden.footer.reden_ecosystem.github_organization') }}
            </reden-router>
          </div>
        </v-col>
        <v-col>
          <div class="footer-list-title">
            <b>
              {{ $t('reden.footer.reden_community.title') }}
            </b>
          </div>
          <div class="footer-list-item">
            <reden-router :to="discordInvite">
              {{ $t('reden.footer.reden_community.discord') }}
            </reden-router>
          </div>
          <div class="footer-list-item">
            <reden-router to="/community-guidelines">
              {{ $t('reden.footer.reden_community.community_guidelines') }}
            </reden-router>
          </div>
          <div class="footer-list-item">
            <reden-router to="/community-events">
              {{ $t('reden.footer.reden_community.community_events') }}
            </reden-router>
          </div>
        </v-col>
        <v-col>
          <div class="footer-list-title">
            <b>
              {{ $t('reden.footer.follow_us.title') }}
            </b>
          </div>
          <div class="footer-list-item">
            <reden-router to="/blog">
              <v-icon icon="mdi-rss" />
              {{ $t('reden.footer.follow_us.blog') }}
            </reden-router>
          </div>
          <div class="footer-list-item">
            <reden-router external-icon to="https://youtube.com/@zly2006">
              <v-icon icon="mdi-youtube" />
              {{ $t('reden.footer.follow_us.youtube') }}
            </reden-router>
          </div>
          <div class="footer-list-item">
            <reden-router
              external-icon
              to="https://space.bilibili.com/1545239761"
            >
              {{ $t('reden.footer.follow_us.bilibili') }}
            </reden-router>
          </div>
        </v-col>
      </v-row>
      <v-row class="">
        <v-col :cols="12" class="text-center">
          <reden-router :to="githubLink">Reden</reden-router>
          and
          <reden-router to="https://github.com/RedenMC/reden-website"
            >this website
          </reden-router>
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
        <span class="bottom-right">
          <v-icon>mdi-earth</v-icon>
          {{ $t(locale) }}
        </span>
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
</style>
