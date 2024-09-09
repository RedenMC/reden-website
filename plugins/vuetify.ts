// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css';

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { customSVGs } from '~/plugins/icons/customSvgs';
import { mdi } from 'vuetify/iconsets/mdi';
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n';

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    ssr: true,
    locale: {
      // adapter: createVueI18nAdapter({ i18n, useI18n }),
    },
    icons: {
      defaultSet: 'mdi',
      sets: {
        mdi,
        custom: customSVGs,
      },
    },
  });
  app.vueApp.use(vuetify);
});
