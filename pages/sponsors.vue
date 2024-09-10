<script lang="ts" setup>
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

const { data: sponsors } = await useFetch<Sponsor[]>(`${process.env.baseUrl}/api/sponsors`, {});
const sorted = computed(() => {
  return sponsors.value
    ? sponsors.value.sort((a: Sponsor, b: Sponsor) => {
        return b.amount - a.amount;
      })
    : [];
});
</script>

<template>
  <h1 class="text-center">
    {{ $t('sponsors.title') }}
  </h1>
  <p class="text-center">
    {{ $t('sponsors.description') }}
  </p>
  <v-card border class="content-common">
    <v-list
      v-for="sponsor in sorted"
      :key="sponsor.name"
      link
      subheader
      three-line
    >
      <!--suppress VueUnrecognizedDirective -->
      <v-list-item :key="sponsor.name" v-ripple>
        <v-list-item-title class="text-h6"
          >{{ sponsor.name }}
        </v-list-item-title>
        <v-list-item-subtitle
          >{{ sponsor.detail || unitDisplay[sponsor.unit] + sponsor.amount }}
        </v-list-item-subtitle>
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
      <img :width="200" alt="" src="@/assets/reden-alipay.png" />
    </p>
    <a class="text-md-h5" href="https://paypal.me/zly2006">
      {{ $t('sponsors.paypal') }}
    </a>
    <v-btn @click="refreshNuxtData()" >Refresh</v-btn>
  </div>
</template>

<style scoped>
.notice {
  padding: 40px;
}
</style>
