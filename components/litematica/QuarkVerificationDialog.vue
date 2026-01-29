<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '@/store/app';
import { doFetchGet, doFetchPost, toastError } from '@/utils/constants';
import { toast } from 'vuetify-sonner';
import QRCode from 'qrcode';

const { t } = useI18n();
const appStore = useAppStore();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'verified'): void;
}>();

const dialog = ref(true);
const loading = ref(false);
const shareUrl = ref('');
const verificationHash = ref('');
const qrCodeDataUrl = ref('');
const userCode = ref('');

// Step states
const isLoggedIn = computed(() => appStore.logined);
const step1Complete = computed(() => isLoggedIn.value);
const step2Complete = ref(false);
const step3Complete = ref(false);

// Generate QR code
async function generateQRCode(url: string) {
  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Failed to generate QR code:', error);
  }
}

// Step 2: Get verification code
async function getVerificationCode() {
  if (!isLoggedIn.value) {
    toast.error('请先登录');
    return;
  }

  loading.value = true;
  try {
    const response = await doFetchGet('/api/revenue/verify-quark-account');
    if (!response.ok) {
      return toastError(response);
    }

    const data = await response.json();
    shareUrl.value = data.shareUrl;
    verificationHash.value = data.hash;
    
    await generateQRCode(data.shareUrl);
    step2Complete.value = true;
    toast.success('已生成验证码');
  } catch (error) {
    toastError(error);
  } finally {
    loading.value = false;
  }
}

// Step 3: Submit verification code
async function submitCode() {
  if (!userCode.value) {
    toast.error('请输入验证码');
    return;
  }

  loading.value = true;
  try {
    const response = await doFetchPost('/api/revenue/verify-quark-complete', {
      code: userCode.value,
    });

    if (!response.ok) {
      return toastError(response);
    }

    const data = await response.json();
    if (data.success) {
      step3Complete.value = true;
      toast.success('验证成功！您已获得免夸克直接下载权限');
      
      // Update user cache to add no-quark role
      if (appStore.userCache) {
        appStore.userCache.roles = [...(appStore.userCache.roles || []), 'no-quark'];
        appStore.save();
      }
      
      setTimeout(() => {
        emit('verified');
        emit('close');
      }, 1500);
    }
  } catch (error) {
    toastError(error);
  } finally {
    loading.value = false;
  }
}

function goToLogin() {
  const localeRoute = useLocaleRoute();
  navigateTo(localeRoute({ path: '/login' })!);
}

function closeDialog() {
  dialog.value = false;
  emit('close');
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-4">
        <v-icon class="mr-2">custom:QuarkCloud</v-icon>
        夸克验证
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Step 1: Login -->
        <div class="d-flex align-start mb-6">
          <v-avatar
            :color="step1Complete ? 'success' : 'primary'"
            class="mr-3"
            size="40"
          >
            <v-icon v-if="step1Complete" color="white">mdi-check</v-icon>
            <span v-else class="text-h6">1</span>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6 mb-2">登录或注册账号</div>
            <v-btn
              v-if="!isLoggedIn"
              color="primary"
              variant="outlined"
              @click="goToLogin"
            >
              {{ t('common.login') }}
            </v-btn>
            <v-chip v-else color="success" variant="outlined">
              <v-icon start>mdi-check-circle</v-icon>
              已登录
            </v-chip>
          </div>
        </div>

        <!-- Step 2: Get QR Code -->
        <div class="d-flex align-start mb-6">
          <v-avatar
            :color="step2Complete ? 'success' : 'primary'"
            class="mr-3"
            size="40"
          >
            <v-icon v-if="step2Complete" color="white">mdi-check</v-icon>
            <span v-else class="text-h6">2</span>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6 mb-2">扫码获取验证码</div>
            <v-btn
              v-if="!step2Complete"
              :disabled="!step1Complete"
              :loading="loading"
              color="primary"
              variant="outlined"
              @click="getVerificationCode"
            >
              生成二维码
            </v-btn>
            <div v-else class="mt-3">
              <v-card border variant="outlined">
                <v-card-text class="text-center pa-4">
                  <img
                    v-if="qrCodeDataUrl"
                    :src="qrCodeDataUrl"
                    alt="QR Code"
                    class="mx-auto"
                    style="max-width: 256px"
                  />
                  <div class="mt-3 text-body-2 text-medium-emphasis">
                    请使用微信扫描二维码
                  </div>
                  <div class="mt-2 text-caption text-medium-emphasis">
                    下载压缩包并解压，获取验证码
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>

        <!-- Step 3: Submit Code -->
        <div class="d-flex align-start">
          <v-avatar
            :color="step3Complete ? 'success' : 'primary'"
            class="mr-3"
            size="40"
          >
            <v-icon v-if="step3Complete" color="white">mdi-check</v-icon>
            <span v-else class="text-h6">3</span>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6 mb-2">输入验证码</div>
            <v-text-field
              v-model="userCode"
              :disabled="!step2Complete || step3Complete"
              density="comfortable"
              hint="下载文件并解压，复制验证码粘贴到此处"
              label="验证码"
              persistent-hint
              placeholder="请输入验证码"
              variant="outlined"
            />
            <v-btn
              :disabled="!step2Complete || !userCode || step3Complete"
              :loading="loading"
              class="mt-3"
              color="primary"
              @click="submitCode"
            >
              提交验证
            </v-btn>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          :disabled="loading"
          variant="outlined"
          @click="closeDialog"
        >
          {{ step3Complete ? t('common.close') : t('common.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-avatar {
  flex-shrink: 0;
}
</style>
