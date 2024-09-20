<script setup lang="ts">
import Empire from '~/components/Empire.vue';

const router = useRouter();
const localeRoute = useLocaleRoute();
const ffa = ref(false);
const wsToken = ref('');
async function startGame() {
  const data = await doFetchPost('/api/generals/ffa', '');
  if (!data.ok) {
    await toastError(data);
    return;
  }
  const token = await data.text();
  ffa.value = true;
  wsToken.value = token;
}
</script>

<template>
  <!--  <empire token="" state="play" />-->
  <template v-if="ffa && wsToken">
    <empire :token="wsToken" />
  </template>
  <v-sheet v-else>
    <v-btn @click="startGame" color="info"> 8 人混战模式 </v-btn>
  </v-sheet>
</template>

<style scoped></style>
