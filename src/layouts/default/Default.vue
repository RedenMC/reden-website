<script lang="ts" setup>
import DefaultView from './View.vue'
import RedenAppBar from "@/appbar/RedenAppBar.vue";
</script>

<template>
  <v-app theme="dark">
    <RedenAppBar/>

    <default-view/>

    <v-footer class="flex-column">
      <div class="text-center w-100">
        <v-row>
          <v-col>
            <div class="footer-list-title">
              <b>Reden Mod</b>
            </div>
            <div class="footer-list-item">
              <a href="/download">Download</a>
            </div>
            <div class="footer-list-item">
              <a href="/feature/undo">Undo & Redo</a>
            </div>
            <div class="footer-list-item">
              <a href="/feature/rvc">Reden Version Control</a>
            </div>
            <div class="footer-list-item">
              <a href="/feature/rvc">Reden Debugger</a>
            </div>
            <div class="footer-list-item">
              <a href="//github.com/zly2006/reden-is-what-we-made">Github</a>
            </div>
          </v-col>
          <v-col>
            <div class="footer-list-title">
              <b>Reden Ecosystem</b>
            </div>
            <div class="footer-list-item">
              <a href="//wiki.redenmc.com">Reden Wiki</a>
            </div>
            <div class="footer-list-item">
              <a href="//hub.redenmc.com">RVC Hub</a>
            </div>
          </v-col>
          <v-col>
            <div class="footer-list-title">
              <b>Reden Community</b>
            </div>
            <div class="footer-list-item">
              <a href="/discord">Discord</a>
            </div>
            <div class="footer-list-item">
              <a href="/community-guidelines">Community Guidelines</a>
            </div>
            <div class="footer-list-item">
              <a href="/community-events">Community Events</a>
            </div>
          </v-col>
          <v-col>
            <div class="footer-list-title">
              <b>Follow Us</b>
            </div>
            <div class="footer-list-item">
              <a href="/blog">
                <v-icon icon="mdi-rss"/> Blog
              </a>
            </div>
            <div class="footer-list-item">
              <a href="//youtube.com/@zly2006">
                <v-icon icon="mdi-youtube"/> Youtube
              </a>
            </div>
            <div class="footer-list-item">
              <a href="https://space.bilibili.com/1545239761">
                Bilibili
              </a>
            </div>
          </v-col>
        </v-row>
      </div>
      <div class="text-center w-100">
        {{ new Date().getFullYear() }} — <strong>RedenMC</strong>
      </div>
    </v-footer>
  </v-app>
</template>

<style scoped>
.footer-list-title {
  font-size: 1em;
  margin-top: 8px;
  margin-bottom: 8px;
}

.footer-list-item {
  margin-bottom: 8px;
  a {
    color: white;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
}
</style>
