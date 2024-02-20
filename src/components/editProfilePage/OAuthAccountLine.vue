<script lang="ts" setup>
import {OAuthAccount} from "@/constants";

const {type, account, icon} = defineProps<{
  type: string,
  account?: OAuthAccount,
  icon?: string
}>()

function unlinkAccount(type: string) {

}
</script>

<template>
  <v-row class="line">
    <v-col>
      <v-icon v-if="icon">{{ icon }}</v-icon>
      <span class="setting-label text-capitalize">
        {{ type }}
      </span>
    </v-col>
    <v-col>
      <p v-if="account">
        {{
          account.email
        }}
      </p>
    </v-col>
    <v-col>
      <v-btn
        v-if="!account"
        :href="`/api/oauth/${type}?redirect_url=/home`"
        class="text-capitalize setting-button"
        color="primary"
      >
        Link Account
      </v-btn>
      <v-btn
        v-if="account"
        class="text-capitalize setting-button"
        color="error"
        @click="unlinkAccount(type)"
      >
        Unlink Account
      </v-btn>
    </v-col>
  </v-row>
</template>

<style scoped>
.line {
  margin: 10px;

}
</style>
