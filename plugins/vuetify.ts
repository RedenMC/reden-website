// import this after install `@mdi/font` package
// import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import { customSVGs } from '~/plugins/icons/customSvgs';
import { mdi } from 'vuetify/iconsets/mdi';

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
    components: {
      ...components,
    },
    theme: {
      themes: {
        /**
         * theme: light app: dark cookie: dark
         *  background #121212 surface #212121 surface-bright #ccbfd6 surface-light #424242 surface-variant #a3a3a3 on-surface-variant #424242 primary #2196F3 primary-darken-1 #277CC1 secondary #54B6B2 secondary-darken-1 #48A9A6 error #CF6679 info #2196F3 success #4CAF50 warning #FB8C00
         */
        dark: {
          dark: true,
          colors: {
            secondary: '#fb7299',
          },
        },
        light: {
          dark: false,
          colors: {
            secondary: '#fb7299',
          },
        },
      },
    },
  });
  app.vueApp.use(vuetify);
});
