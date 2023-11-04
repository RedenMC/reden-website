/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '../store'
import router from '../router'

// Types
import type { App } from 'vue'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import {i18n} from "@/plugins/i18n";

export function registerPlugins (app: App) {
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(i18n)
}
