<script setup lang="ts">
import { doFetchGet } from '@/utils/constants';
import { ref } from 'vue';
import { toast } from 'vuetify-sonner';
definePageMeta({
  title: 'sponsors.title',
});

type Sponsor = {
  name: string;
  detail?: string;
  avatar: string;
  amount: number;
  unit: string;
  message?: string;
};

const unitDisplay: Record<string, string> = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
  JPY: 'JP¥',
  KRW: '₩',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  HKD: 'HK$',
};

const sponsors = ref<Sponsor[]>([]);
if (import.meta.client) {
  doFetchGet('/api/sponsors')
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return Promise.reject('Failed to fetch sponsors');
      }
    })
    .then((data) => {
      sponsors.value = data.sort((a: Sponsor, b: Sponsor) => {
        return b.amount - a.amount;
      });
    })
    .catch((e) => {
      console.error(e);
      toast('Failed to fetch sponsors', {
        description: 'Please try again later',
        duration: 5000,
        cardProps: {
          color: 'error',
        },
      });
    });
}
</script>

<template>
  <h1 class="text-center">
    {{ $t('sponsors.title') }}
  </h1>
  <p class="text-center">
    {{ $t('sponsors.description') }}
  </p>
  <v-card class="content-common" border>
    <v-list
      subheader
      three-line
      link
      v-for="sponsor in sponsors"
      :key="sponsor.name"
    >
      <!--suppress VueUnrecognizedDirective -->
      <v-list-item :key="sponsor.name" v-ripple>
        <v-list-item-title class="text-h6">{{
          sponsor.name
        }}</v-list-item-title>
        <v-list-item-subtitle>{{
          sponsor.detail || unitDisplay[sponsor.unit] + sponsor.amount
        }}</v-list-item-subtitle>
        <v-list-item-action>
          <v-img :src="sponsor.avatar" />
        </v-list-item-action>

        <div v-html="sponsor.message" />
      </v-list-item>
    </v-list>
  </v-card>
  <div class="text-center content-common notice">
    <p>
      {{ $t('sponsors.notice') }}
    </p>
    <p class="text-md-h5">
      {{ $t('sponsors.alipay') }}
      <br />
      <img src="@/assets/reden-alipay.png" alt="" :width="200" />
    </p>
    <a class="text-md-h5" href="https://paypal.me/zly2006">
      {{ $t('sponsors.paypal') }}
    </a>
  </div>
</template>

<style scoped>
.notice {
  padding: 40px;
}
</style>
