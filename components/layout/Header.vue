<template>
  <v-app-bar :elevation="2" class="reden-app-bar" color="transparent">
    <template #prepend>
      <template v-if="mobile">
        <v-btn v-show="mobile" icon="mdi-menu" title="Menu">
          <v-avatar image="/reden_256.png" :size="48" border />
          <v-menu :close-on-content-click="true" activator="parent">
            <v-list class="w-100">
              <v-list-item :to="localePath('/')">
                <template #prepend>
                  <v-icon>mdi-home</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t('reden.header.home') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item :to="localePath('/feature')">
                <template #prepend>
                  <v-icon>mdi-view-dashboard</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t('reden.header.mod') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item :to="localePath('/litematica')">
                <template #prepend>
                  <v-icon>mdi-download</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t('reden.header.explore') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item :to="localePath('/studio')">
                <template #prepend>
                  <v-icon>mdi-pencil</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t('studio.litematica_studio') }}
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
                    {{ $t('reden.header.my_profile') }}
                  </v-list-item-title>
                </v-list-item>
              </template>
              <template v-else>
                <v-list-item :to="localePath('/login')">
                  <template #prepend>
                    <v-icon>mdi-account</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ $t('login.button.login') }}
                  </v-list-item-title>
                </v-list-item>
                <v-list-item :to="localePath('/register')">
                  <template #prepend>
                    <v-icon>mdi-account-plus</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ $t('register.button.register') }}
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
                    {{ $t('admin.title.admin') }}
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
          {{ $t('reden.header.explore') }}
        </v-btn>
        <v-btn
          :to="localePath('/studio')"
          class="text-capitalize px-1"
          size="large"
        >
          {{ $t('studio.litematica_studio') }}
        </v-btn>
      </template>
    </template>
    <p class="text-h5"></p>
    <v-text-field
      id="search"
      v-model="search"
      :placeholder="$t('reden.header.search')"
      class="mx-auto max-w-520px"
      density="comfortable"
      hide-details
      rounded="xl"
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
      <v-btn icon="mdi-translate" title="Language">
        <v-icon icon="mdi-translate" />
        <v-menu :close-on-content-click="true" activator="parent">
          <v-list active-color="primary">
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
        {{ $t('reden.header.upload') }}
      </v-btn>
    </template>
  </v-app-bar>
</template>
<script lang="ts" setup>
import { useDisplay } from 'vuetify';
import { useAppStore } from '~/store/app';

const router = useRouter();
const localePath = useLocalePath();
const switchLocalePath = useSwitchLocalePath();

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

.header-search :deep(.v-input__control > .v-field--appended) {
  padding-inline-end: 0 !important;
}
</style>
