<script lang="ts" setup>
import DefaultView from './View.vue';
import RedenAppBar from '@/appbar/RedenAppBar.vue';
import { VSonner } from 'vuetify-sonner';
import { theme } from '@/constants';
import { onMounted } from 'vue';
import vuetify from '@/plugins/vuetify';


onMounted(() => {
  // set body background color
  document.body.style.backgroundColor =
    vuetify.theme.themes.value[theme.value].colors['background']!;
});

</script>

<template>
  <v-app :theme="theme">
    <RedenAppBar />

    <VSonner :expand="true" :position="'top-right'" />
    <default-view />

    <v-footer class="flex-column" border>
      <v-row class="text-center">
        <v-col>
          <div class="footer-list-title">
            <b>
              {{ $t('reden.footer.reden_mod.title') }}
            </b>
          </div>
          <div class="footer-list-item">
            <RouterLink to="/download">
              {{ $t('reden.download') }}
            </RouterLink>
          </div>
          <div class="footer-list-item">
            <RouterLink to="/feature/undo">
              {{ $t('reden.footer.reden_mod.undo_redo') }}
            </RouterLink>
          </div>
          <div class="footer-list-item">
            <RouterLink to="/feature/rvc">
              {{ $t('reden.footer.reden_mod.rvc') }}
            </RouterLink>
          </div>
          <div class="footer-list-item">
            <RouterLink to="/feature/debugger">
              {{ $t('reden.footer.reden_mod.debugger') }}
            </RouterLink>
          </div>
        </v-col>
        <v-col>
          <div class="footer-list-title">
            <b>
              {{ $t('reden.footer.reden_ecosystem.title') }}
            </b>
          </div>
          <div class="footer-list-item">
            <a href="https://github.com/zly2006/reden-is-what-we-made">
              Reden on Github
            </a>
          </div>
          <div class="footer-list-item">
            <a href="//wiki.redenmc.com">
              {{ $t('reden.footer.reden_ecosystem.wiki') }}
            </a>
          </div>
          <div class="footer-list-item">
            <RouterLink to="/sponsors">
              {{ $t('reden.footer.reden_ecosystem.sponsors') }}
            </RouterLink>
          </div>
          <div class="footer-list-item">
            <a href="//github.com/RedenMC">
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
            <RouterLink to="/discord">
              {{ $t('reden.footer.reden_community.discord') }}
            </RouterLink>
          </div>
          <div class="footer-list-item">
            <RouterLink to="/community-guidelines">
              {{ $t('reden.footer.reden_community.community_guidelines') }}
            </RouterLink>
          </div>
          <div class="footer-list-item">
            <RouterLink to="/community-events">
              {{ $t('reden.footer.reden_community.community_events') }}
            </RouterLink>
          </div>
        </v-col>
        <v-col>
          <div class="footer-list-title">
            <b>
              {{ $t('reden.footer.follow_us.title') }}
            </b>
          </div>
          <div class="footer-list-item">
            <RouterLink to="/blog">
              <v-icon icon="mdi-rss" />
              {{ $t('reden.footer.follow_us.blog') }}
            </RouterLink>
          </div>
          <div class="footer-list-item">
            <a href="//youtube.com/@zly2006">
              <v-icon icon="mdi-youtube" />
              {{ $t('reden.footer.follow_us.youtube') }}
            </a>
          </div>
          <div class="footer-list-item">
            <a href="https://space.bilibili.com/1545239761">
              {{ $t('reden.footer.follow_us.bilibili') }}
            </a>
          </div>
        </v-col>
      </v-row>
      <v-row class="last-line">
        <v-col class="text-center" :cols="12">
          <a href="https://github.com/zly2006/reden-is-what-we-made">Reden</a>
          and
          <a href="https://github.com/RedenMC/reden-website">this website</a>
          are both free software.
          <br />
          {{ new Date().getFullYear() }} — <b>RedenMC</b>
        </v-col>
      </v-row>
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
</style>
