<script lang="ts" setup>
import { discordInvite, githubLink, zh_cn } from '~/utils/constants';
import RedenRouter from '~/components/RedenRouter.vue';
import { useAppStore } from '~/store/app';
import gitHash from '~/assets/hash.json';

const localePath = useLocalePath();
const switchLocalePath = useSwitchLocalePath();

const { t, locale } = useI18n();
const appStore = useAppStore();
</script>

<template>
  <v-footer border class="flex-column router">
    <v-row class="text-center">
      <v-col>
        <div class="footer-list-title">
          <b>
            {{ $t('reden.footer.reden_mod.title') }}
          </b>
        </div>
        <div class="footer-list-item">
          <reden-router :to="localePath('/')">
            {{ $t('reden.title.home') }}
          </reden-router>
        </div>
        <div class="footer-list-item">
          <reden-router :to="localePath('/download')">
            {{ $t('reden.download') }}
          </reden-router>
        </div>
        <div class="footer-list-item">
          <reden-router :to="localePath('/feature/undo')">
            {{ $t('reden.footer.reden_mod.undo_redo') }}
          </reden-router>
        </div>
        <div class="footer-list-item">
          <reden-router :to="localePath('/feature/rvc')">
            {{ $t('reden.footer.reden_mod.rvc') }}
          </reden-router>
        </div>
        <div class="footer-list-item">
          <reden-router :to="localePath('/feature/debugger')">
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
          <a href="https://wiki.redenmc.com">
            {{ $t('reden.footer.reden_ecosystem.wiki') }}
          </a>
        </div>
        <div class="footer-list-item">
          <reden-router :to="localePath('/sponsors')">
            {{ $t('reden.footer.reden_ecosystem.sponsors') }}
          </reden-router>
        </div>
        <div class="footer-list-item">
          <reden-router to="https://github.com/RedenMC">
            {{ $t('reden.footer.reden_ecosystem.github_organization') }}
          </reden-router>
        </div>
        <div class="footer-list-item">
          <reden-router no-external-icon to="https://api.redenmc.com/openapi/">
            OpenAPI
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
          <reden-router :to="localePath('/litematica')">
            {{ $t('litematica_generator.title') }}
          </reden-router>
        </div>
        <div class="footer-list-item">
          <reden-router :to="localePath('/community-guidelines')">
            {{ $t('reden.footer.reden_community.community_guidelines') }}
          </reden-router>
        </div>
        <div class="footer-list-item">
          <reden-router :to="localePath('/dmca')">
            {{ $t('reden.footer.reden_community.copyright_complaint') }}
          </reden-router>
        </div>
      </v-col>
      <v-col>
        <div class="footer-list-title">
          <b>
            {{ $t('reden.footer.social.title') }}
          </b>
        </div>
        <div class="footer-list-item">
          <reden-router :to="discordInvite">
            {{ $t('reden.footer.reden_community.discord') }}
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
            <v-icon icon="custom:Bilibili" />
            {{ $t('reden.footer.follow_us.bilibili') }}
          </reden-router>
        </div>
      </v-col>
    </v-row>
    <v-row class="">
      <v-col :cols="12" class="text-center">
        <reden-router :to="githubLink">Reden</reden-router>
        {{ $t('common.and') }}
        <reden-router to="https://github.com/RedenMC/reden-website"
          >{{ $t('reden.footer.this_website') }}
        </reden-router>
        <span class="text-caption opacity-60"> @{{ gitHash }} </span>
        {{ $t('reden.footer.are_both_free_software') }}
        <br />
        {{ new Date().getFullYear() }} — <b>RedenMC</b>
      </v-col>
    </v-row>
    <div class="text-right last-line">
      <a
        v-if="locale == zh_cn"
        class="bottom-right"
        href="https://beian.miit.gov.cn/"
      >
        备案号： 京ICP备2021010288号-6
      </a>
      <span class="bottom-right">
        <a
          href="javascript:void(0)"
          @click="
            appStore.gads = !appStore.gads;
            appStore.save();
          "
        >
          {{ appStore.gads ? 'Disable' : 'Enable' }}
          Google ads
        </a>
      </span>
      <span class="bottom-right"> Privacy </span>
      <span class="router bottom-right">
        <a href="javascript:void(0)">
          <v-dialog activator="parent" max-width="500">
            <v-card>
              <v-card-title>Manage Cookies</v-card-title>
              <v-card-text>
                This website uses cookies only for basic functions, such as
                login and language settings. We do not use cookies for
                advertising or tracking. By using this website, you agree to our
                <reden-router class="router" to="/privacy">
                  Privacy Policy
                </reden-router>
              </v-card-text>
            </v-card>
          </v-dialog>
          Cookies
        </a>
      </span>
      <span class="bottom-right">
        <a href="https://status.redenmc.com">Status</a>
      </span>
      <a class="bottom-right">
        <v-icon>mdi-earth</v-icon>
        {{ t(locale) }}

        <v-menu :close-on-content-click="true" activator="parent">
          <v-list active-color="primary">
            <v-list-item
              v-for="locale in $i18n.availableLocales"
              :key="`locale-${locale}`"
              :to="switchLocalePath(locale)"
            >
              <v-list-item-title>{{ t(locale) }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </a>
    </div>
  </v-footer>
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

.last-line {
  width: 100%;
}

.bottom-right {
  font-size: 0.7em;
  opacity: 0.7;
  padding: 6px;
}
</style>
