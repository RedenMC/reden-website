<script lang="ts" setup>
import { type Captcha, cloudflareCAPTCHAKey } from '@/utils/constants';
import VueTurnstile from 'vue-turnstile';
import { onMounted, ref } from 'vue';
import { useAppStore } from '~/store/app';

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
const props = defineProps<{
  forceCn?: boolean;
}>();

watch(model, (newVal) => {
  console.log('Captcha model changed:', newVal);
});

const appStore = useAppStore();
const china = ref(props.forceCn || (await appStore.isInChina()));
onMounted(async () => {
  model.value = {
    provider: '',
    token: '',
    server: null,
  };
  china.value = props.forceCn || (await appStore.isInChina());
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
          const serverToken = obj.getServerToken();
          model.value = {
            server: serverToken.server,
            provider: 'vaptcha',
            token: serverToken.token,
          };
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
  <template v-if="china">
    <AliyunCaptcha
      v-if="!model?.token"
      @captcha-token="
        (s) =>
          (model = {
            provider: 'aliyun',
            token: s,
            server: null,
          })
      "
    />
  </template>
  <template v-else>
    <vue-turnstile
      model-value=""
      @update:model-value="
        (token) => (model = { provider: 'cloudflare', token, server: null })
      "
      :site-key="cloudflareCAPTCHAKey"
    />
  </template>
</template>

<style scoped></style>
