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

function test() {
  const ws = new WebSocket('ws://localhost:10005/ws/test')

  ws.onopen = (event) => {
    console.log('ws: open');
    setInterval(() => {
      ws.send('ws: client send test')
    }, 100)
    ws.onmessage = (event) => {
      console.log('ws:', event.data);
      const packet = JSON.parse(event.data);
      switch (packet.type) {
      }
    };
    ws.onclose = (event) => {
      console.log('ws: close', event);
    };
  };
}
</script>

<template>
  <template v-if="ffa && wsToken">
    <empire :token="wsToken" />
  </template>
  <v-sheet v-else>
    <v-btn @click="startGame" color="info"> 8 人混战模式 </v-btn>
    <v-btn
      color="green"
      text="测试"
      @click="test"/>
  </v-sheet>
</template>

<style scoped></style>
