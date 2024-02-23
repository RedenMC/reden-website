<script lang="ts" setup>
import DefaultView from './View.vue';
import RedenAppBar from '@/appbar/RedenAppBar.vue';
import { VSonner } from 'vuetify-sonner';
</script>

<template>
  <v-app theme="dark">
    <RedenAppBar />

    <VSonner :expand="true" :position="'top-right'" />
    <default-view />

    <v-footer class="flex-column">
      <div class="text-center w-100">
        <v-row>
          <v-col>
            <div class="footer-list-title">
              <b>
                {{ $t('reden.footer.reden_mod.title') }}
              </b>
            </div>
            <div class="footer-list-item">
              <a href="/download">
                {{ $t('reden.download') }}
              </a>
            </div>
            <div class="footer-list-item">
              <a href="/feature/undo">
                {{ $t('reden.footer.reden_mod.undo_redo') }}
              </a>
            </div>
            <div class="footer-list-item">
              <a href="/feature/rvc">
                {{ $t('reden.footer.reden_mod.rvc') }}
              </a>
            </div>
            <div class="footer-list-item">
              <a href="/feature/debugger">
                {{ $t('reden.footer.reden_mod.debugger') }}
              </a>
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
              <a href="/sponsors">
                {{ $t('reden.footer.reden_ecosystem.sponsors') }}
              </a>
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
              <a href="/discord">
                {{ $t('reden.footer.reden_community.discord') }}
              </a>
            </div>
            <div class="footer-list-item">
              <a href="/community-guidelines">
                {{ $t('reden.footer.reden_community.community_guidelines') }}
              </a>
            </div>
            <div class="footer-list-item">
              <a href="/community-events">
                {{ $t('reden.footer.reden_community.community_events') }}
              </a>
            </div>
          </v-col>
          <v-col>
            <div class="footer-list-title">
              <b>
                {{ $t('reden.footer.follow_us.title') }}
              </b>
            </div>
            <div class="footer-list-item">
              <a href="/blog">
                <v-icon icon="mdi-rss" />
                {{ $t('reden.footer.follow_us.blog') }}
              </a>
            </div>
            <div class="footer-list-item">
              <a href="//youtube.com/@zly2006">
                <v-icon icon="mdi-youtube" />
                {{ $t('reden.footer.follow_us.youtube') }}
              </a>
            </div>
            <div class="footer-list-item">
              <a class="link" href="https://space.bilibili.com/1545239761">
                {{ $t('reden.footer.follow_us.bilibili') }}
              </a>
            </div>
          </v-col>
        </v-row>
      </div>
      <v-row class="last-line">
        <v-col class="text-center">
          <a href="https://github.com/zly2006/reden-is-what-we-made">Reden</a>
          and
          <a href="https://github.com/RedenMC/reden-website">this website</a>
          are both free software.
          <br />
          {{ new Date().getFullYear() }} — <strong>RedenMC</strong>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<style scoped>
.footer-list-title {
  font-size: 1em;
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
  color: #cccccc;
  text-decoration: none;
}

a:hover {
  color: #ffffff;
  text-decoration: underline;
}

.last-line {
  margin-top: 16px;
}
</style>
