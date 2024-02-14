<script setup lang="ts">
import {doFetchGet} from "@/constants";
import {ref, Ref} from "vue";
import {toast, VSonner} from "vuetify-sonner";

type Sponsor = {
  name: string
  detail: string
  avatar: string
  amount: number
  message: string
}

const sponsors: Ref<Sponsor[]> = ref([])
doFetchGet('/api/sponsors').then((res) => {
  if (res.ok) {
    return res.json()
  } else {
    Promise.reject('Failed to fetch sponsors')
  }
}).then(data => {
  sponsors.value = data.sort((a: Sponsor, b: Sponsor) => {
    return b.amount - a.amount
  })
}).catch((e) => {
  console.error(e)
  toast('Failed to fetch sponsors', {
    description: 'Please try again later',
    duration: 5000,
    cardProps: {
      color: 'error'
    }
  })
})
</script>

<template>
  <VSonner position="top-center"/>

  <h1 class="text-center">
    {{ $t('sponsors.title') }}
  </h1>
  <p class="text-center">
    {{ $t('sponsors.description') }}
  </p>
  <div class="content-common">
    <v-list
      subheader
      three-line
      link
      v-for="sponsor in sponsors"
      :key="sponsor.name"
    >
      <v-list-item
        :key="sponsor.name"
        v-ripple
        >
        <v-list-item-title class="text-h6">{{ sponsor.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ sponsor.detail || '¥' + sponsor.amount }}</v-list-item-subtitle>
        <v-list-item-action>
          <v-img :src="sponsor.avatar"/>
        </v-list-item-action>

        <div v-html="sponsor.message" />
      </v-list-item>
    </v-list>
  </div>
</template>

<style scoped>
a {
  color: #cccccc;
  text-decoration: none;
}

a:hover {
  color: #ffffff;
  text-decoration: underline;
}

</style>
