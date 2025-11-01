<template>
  <v-btn id="captcha-button" variant="outlined">点击进行人机验证</v-btn>
  <div id="captcha-element"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const emit = defineEmits<{
  'captcha-token': [string];
}>();

const captcha = ref<any>(null);
const captchaButton = ref<HTMLElement | null>(null);

const getInstance = (instance: any) => {
  captcha.value = instance;
};

const captchaVerifyCallback = async (captchaVerifyParam: any) => {
  emit('captcha-token', captchaVerifyParam);
  console.log(captchaVerifyParam);
  return {
    captchaResult: true,
    bizResult: true,
  };
};

// 验证通过后调用
const onBizResultCallback = () => {
  console.log('onBizResultCallback');
};

onMounted(() => {
  captchaButton.value = document.getElementById('captcha-button');

  const script = document.createElement('script');
  script.src =
    'https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js';
  script.async = true;
  script.onload = () => {
    (window as any).initAliyunCaptcha({
      SceneId: '16q3of0p', // 场景ID。根据步骤二新建验证场景后，您可以在验证码场景列表，获取该场景的场景ID
      prefix: 'b22hoj', // 身份标。开通阿里云验证码2.0后，您可以在控制台概览页面的实例基本信息卡片区域，获取身份标
      mode: 'popup', // 验证码模式。popup表示要集成的验证码模式为弹出式。无需修改
      element: '#captcha-element', // 页面上预留的渲染验证码的元素，与原代码中预留的页面元素保持一致。
      button: '#captcha-button', // 触发验证码弹窗的元素。button表示单击登录按钮后，触发captchaVerifyCallback函数。您可以根据实际使用的元素修改element的值
      captchaVerifyCallback: captchaVerifyCallback, // 业务请求(带验证码校验)回调函数，无需修改
      onBizResultCallback: onBizResultCallback, // 业务请求结果回调函数，无需修改
      getInstance: getInstance, // 绑定验证码实例函数，无需修改
      slideStyle: {
        width: 360,
        height: 40,
      }, // 滑块验证码样式，支持自定义宽度和高度，单位为px。其中，width最小值为320 px
      language: 'cn', // 验证码语言类型，支持简体中文（cn）、繁体中文（tw）、英文（en）
    });
  };
  document.getElementsByTagName('head')[0].appendChild(script);
});

onBeforeUnmount(() => {
  captchaButton.value = null;

  // 必须删除相关元素，否则再次mount多次调用 initAliyunCaptcha 会导致多次回调 captchaVerifyCallback
  document.getElementById('aliyunCaptcha-mask')?.remove();
  document.getElementById('aliyunCaptcha-window-popup')?.remove();
});
</script>

<style></style>
