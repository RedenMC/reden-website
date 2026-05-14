<template>
  <v-app-bar :elevation="2" class="reden-app-bar" color="transparent">
    <template #prepend>
      <template v-if="mobile">
        <v-btn v-show="mobile" icon="mdi-menu" title="Menu">
          <v-avatar :size="48" border image="/reden_256.png" />
          <v-menu :close-on-content-click="true" activator="parent">
            <v-list class="w-100">
              <v-list-item :to="localePath('/')">
                <template #prepend>
                  <v-icon>mdi-home</v-icon>
                </template>
                <v-list-item-title>
                  {{ t('reden.header.home') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item :to="localePath('/feature')">
                <template #prepend>
                  <v-icon>mdi-view-dashboard</v-icon>
                </template>
                <v-list-item-title>
                  {{ t('reden.header.mod') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item :to="localePath('/litematica')">
                <template #prepend>
                  <v-icon>mdi-download</v-icon>
                </template>
                <v-list-item-title>
                  {{ t('reden.header.explore') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item :to="localePath('/studio')">
                <template #prepend>
                  <v-icon>mdi-pencil</v-icon>
                </template>
                <v-list-item-title>
                  {{ t('reden.header.studio') }}
                </v-list-item-title>
              </v-list-item>
              <v-divider />
              <template v-if="useAppStore().logined">
                <v-list-item :to="localePath('/home')">
                  <template #prepend>
                    <v-avatar
                      v-if="useAppStore().userCache?.avatarUrl"
                      :image="useAppStore().userCache?.avatarUrl"
                      :size="40"
                    />
                    <v-icon v-else> mdi-account</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ t('reden.header.my_profile') }}
                  </v-list-item-title>
                </v-list-item>
                <v-list-item :to="localePath('/home/notifications')">
                  <template #prepend>
                    <v-badge
                      v-if="useMessageStore().unreadCount > 0"
                      :content="useMessageStore().unreadCount"
                      :max="99"
                      color="error"
                      floating
                    >
                      <v-icon>mdi-bell</v-icon>
                    </v-badge>
                    <v-icon v-else>mdi-bell</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ t('message.list_title') }}
                  </v-list-item-title>
                </v-list-item>
              </template>
              <template v-else>
                <v-list-item :to="localePath('/login')">
                  <template #prepend>
                    <v-icon>mdi-account</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ t('login.button.login') }}
                  </v-list-item-title>
                </v-list-item>
                <v-list-item :to="localePath('/register')">
                  <template #prepend>
                    <v-icon>mdi-account-plus</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ t('register.button.register') }}
                  </v-list-item-title>
                </v-list-item>
              </template>
              <v-divider />
              <template v-if="useAppStore().userCache?.isStaff">
                <v-list-item :to="localePath('/admin')">
                  <template #prepend>
                    <v-icon>mdi-cog</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ t('admin.title.admin') }}
                  </v-list-item-title>
                </v-list-item>
              </template>
              <slot name="mobile-menu-append" />
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
          :active="false"
          :to="localePath('/admin')"
          prepend-icon="mdi-cog"
          stacked
          title="Admin"
        >
          Admin
        </v-btn>
        <v-btn
          :to="localePath('/litematica')"
          class="text-capitalize px-1"
          size="large"
        >
          {{ t('reden.header.explore') }}
        </v-btn>
        <v-btn
          :to="localePath('/studio')"
          class="text-capitalize px-1"
          size="large"
        >
          {{ t('studio.litematica_studio') }}
        </v-btn>
      </template>
    </template>
    <p class="text-h5"></p>
    <v-text-field
      id="search"
      :title="t('reden.header.search')"
      v-model="search"
      :placeholder="t('reden.header.search')"
      class="mx-auto max-w-520px"
      density="comfortable"
      hide-details
      rounded="xl"
      clearable
      variant="outlined"
      @keydown.prevent.enter="
        router.push(localePath(`/litematica?q=${search}`))
      "
    >
      <template #append-inner>
        <v-btn
          icon="mdi-magnify"
          @click="router.push(localePath(`/litematica?q=${search}`))"
        />
      </template>
    </v-text-field>
    <template #append>
      <template v-if="mdAndUp">
        <v-btn :href="githubLink" icon="mdi-github" title="Github" />
        <v-btn
          :href="discordInvite"
          icon="custom:DiscordIcon"
          title="Discord"
        />
        <slot name="desktop-append" />
      </template>
      <slot name="common-append" />
      <client-only>
        <NotificationBell v-if="useAppStore().logined" />
      </client-only>
      <v-btn icon="mdi-translate" title="Language">
        <v-icon icon="mdi-translate" />
        <v-menu :close-on-content-click="true" activator="parent">
          <v-list color="primary">
            <v-list-item
              v-for="locale in availableLocales"
              :key="`locale-${locale}`"
              :to="switchLocalePath(locale)"
            >
              <v-list-item-title>{{ t(locale) }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
      <client-only>
        <v-btn
          :to="localePath(useAppStore().logined ? '/home' : '/login')"
          icon="mdi-account"
          title="Account"
        />
      </client-only>
      <v-btn
        v-if="!mobile"
        :active="false"
        :to="localePath('/litematica#upload')"
        class="ma-2 text-capitalize px-1 mx-1"
        color="secondary"
        prepend-icon="mdi-upload"
        stacked
        variant="text"
      >
        {{ t('reden.header.upload') }}
      </v-btn>
    </template>
  </v-app-bar>
</template>
<script lang="ts" setup>
import { useDisplay } from 'vuetify';
import { useAppStore } from '~/store/app';
import { useMessageStore } from '~/store/message';
import NotificationBell from '~/components/notification/NotificationBell.vue';

const router = useRouter();
const localePath = useLocalePath();
const switchLocalePath = useSwitchLocalePath();
const { t, availableLocales } = useI18n();
const { mobile, mdAndUp } = useDisplay({
  mobileBreakpoint: 640,
});

const slots = defineSlots<{
  'common-append': void;
  'desktop-append': void;
  'mobile-menu-append': void;
}>();

const search = ref((router.currentRoute.value.query.q as string) ?? '');
watch(router.currentRoute, (value) => {
  search.value = (value.query.q as string) ?? '';
});
</script>
<style scoped>
.reden-app-bar {
  backdrop-filter: blur(10px);
}

.max-w-520px {
  max-width: 520px;
}

:deep(.v-input__control > .v-field--appended) {
  padding-inline-end: 0 !important;
}
</style>
