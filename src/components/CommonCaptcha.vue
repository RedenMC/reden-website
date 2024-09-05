<script lang="ts" setup>
import { Captcha, cloudflareCAPTCHAKey, isInChina } from '@/constants';
import VueTurnstile from 'vue-turnstile';
import { onMounted, ref, watch } from 'vue';

const vaptcha = ref();

function loadV3Script() {
  if (typeof window.vaptcha === 'function') {
    //如果已经加载就直接放回
    return Promise.resolve();
  } else {
    return new Promise<void>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://v.vaptcha.com/v3.js';
      script.async = true;
      script.onload = function () {
        resolve();
        script.onload = null;
      };
      document.getElementsByTagName('head')[0].appendChild(script);
    });
  }
}

const model = defineModel<Captcha>();
model.value = {
  provider: '',
  token: '',
  server: null,
};
const props = defineProps<{
  forceCn?: boolean;
}>();

const china = ref(props.forceCn || (await isInChina()));
model.value!.provider = china.value ? 'vaptcha' : 'cloudflare';
watch(china, () => {
  model.value!.provider = china.value ? 'vaptcha' : 'cloudflare';
});
if (china.value) {
  onMounted(() => {
    const config = {
      vid: '66d9a87cdc0ff12924d9a540',
      mode: 'click',
      scene: 0,
      container: vaptcha.value,
      style: 'light',
      color: '#00BFFF',
      lang: 'auto',
      area: 'auto',
    };
    loadV3Script().then(() => {
      window.vaptcha(config).then((obj) => {
        // vue3需要将obj存储到vue外部，例如window对象
        window.vaptchaObj = obj;

        obj.listen('pass', function () {
          // this.token = obj.getToken();
          // alert('pass');
          const serverToken = obj.getServerToken();
          model.value!.token = serverToken.token;
          model.value!.server = serverToken.server;
          model.value!.provider = 'vaptcha';
        });
        obj.listen('close', function () {
          obj.reset();
        });

        obj.render();
      });
    });
  });
}
</script>

<template>
  <v-btn v-if="china" @click="china = false"> 使用 Cloudflare 验证码 </v-btn>
  <template v-if="china">
    <div ref="vaptcha" />
  </template>
  <template v-else>
    <vue-turnstile v-model="model!.token!" :site-key="cloudflareCAPTCHAKey" />
  </template>
</template>

<style scoped></style>
