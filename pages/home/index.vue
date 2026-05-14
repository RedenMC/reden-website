<script lang="ts" setup>
import {
  doFetchGet,
  doFetchPut,
  fetchUser,
  isEarningPlanOk,
  type Profile,
  toastError,
} from '@/utils/constants';
import '~/components/profile/user-card-wrap.css';
import { toast } from 'vuetify-sonner';
import { useAppStore } from '@/store/app';
import UserProfileCard from '~/components/profile/UserProfileCard.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import UserContentPanel from '~/components/profile/UserContentPanel.vue';
import type { ListLitematicaResponse } from '~/pages/litematica/index.vue';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const localePath = useLocalePath();
const { t, locale } = useI18n();
useHead({
  title: t('reden.my_account'),
  titleTemplate: '%s - Reden',
});
definePageMeta({
  needLogin: true,
});

let user = ref<Profile>();
const loading = ref(true);
// webhook
const needInstallWebhook = ref(false);
if (import.meta.client) {
  fetchUser(user).then(() => (loading.value = false));
  if (false) {
    doFetchGet('/api/account/activity').then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          console.log(data);
        });
      } else {
        if (response.status === 412) {
          needInstallWebhook.value = true;
        } else if (response.status === 404) {
          // nothing
        } else {
          toastError(response);
        }
      }
    });
  }
}

function logout() {
  doFetchGet('/api/account/logout')
    .then((response) => {
      if (response.ok) {
        router.push('/');
        toast.success('Logout Successful', {
          description: 'You have been logged out',
          duration: 1000,
        });
      } else {
        return Promise.reject(response);
      }
    })
    .catch((e) => toastError(e, 'Failed to logout'));
  useAppStore().logout();
}

function installWebhook() {
  doFetchPut('/api/github/reden-webhook', {})
    .then((response) =>
      response.ok ? response.json() : Promise.reject(response),
    )
    .then((data: { action: string; redirect?: string | null }) => {
      if (data.action === 'confirm' && data.redirect) {
        location.href = data.redirect;
      }
      console.log(data);
    })
    .catch((e) => toastError(e, 'Failed to update webhook'));
}

const personalToken = ref('');
const tokenExpiresAt = ref<Date>();
const tokenScopes = ref<string[]>(['backup/*', 'me']);

function getPersonalToken() {
  if (!tokenExpiresAt.value) {
    toast('请选择一个有效期', {
      cardProps: { color: 'red' },
    });
    return;
  }
  doFetchPut('/api/account/access-token', {
    note: `Personal Token ${new Date().toISOString()}`,
    scope: tokenScopes.value,
    expiresAt: Number(tokenExpiresAt.value!),
  }).then((response) => {
    if (response.ok) {
      response.text().then((data) => {
        personalToken.value = data;
      });
    } else {
      toastError(response);
    }
  });
}

const page = ref(1);
const sortType = ref<'createdAt' | 'downloads'>('createdAt');
watch(sortType, () => {
  page.value = 1;
});

const { data: machines } = useFetch<ListLitematicaResponse>(
  () =>
    `/api/mc-services/litematica/by-author?author=${user.value?.username}&pageSize=12&page=${page.value}&order=${sortType.value}`,
);
</script>

<template>
  <div>
    <v-banner
      v-if="needInstallWebhook"
      :stacked="true"
      border
      color="info"
      icon="mdi-information-variant"
    >
      <v-banner-text>
        You have not installed the webhook yet. Please install the webhook to
        enable the activity tracking feature.
      </v-banner-text>
      <template #actions>
        <v-btn color="primary" @click="installWebhook">
          Install Webhook

          <v-dialog activator="parent">
            <v-card>
              <v-card-title>Install Webhook</v-card-title>
              <v-card-text> Redirecting...</v-card-text>
            </v-card>
          </v-dialog>
        </v-btn>
        <v-btn color="gray" @click="needInstallWebhook = false"> Dismiss</v-btn>
      </template>
    </v-banner>

    <v-row class="d-flex flex-wrap flex-row ma-1">
      <v-col class="user-card-wrap" cols="12" md="3">
        <v-skeleton-loader v-show="loading" type="card-avatar" width="300" />
        <UserProfileCard
          v-show="!loading"
          :apply-preference="false"
          :min-width="0"
          :user="user"
        >
          <template #actions>
            <v-row>
              <v-col>
                <v-btn
                  :to="localePath('/home/edit')"
                  class="text-none mt-3"
                  color="secondary"
                  href="/"
                  rounded="lg"
                  variant="outlined"
                >
                  {{ t('profile.editProfile') }}
                </v-btn>
              </v-col>
            </v-row>
          </template>
        </UserProfileCard>
      </v-col>

      <v-col>
        <div class="d-flex flex-row flex-wrap gap-8">
          <v-btn color="primary" @click="logout">
            {{ t('profile.logout') }}
          </v-btn>
          <v-btn border>
            生成个人密钥
            <v-dialog activator="parent" max-width="600">
              <v-form v-if="!personalToken" @submit.prevent="getPersonalToken">
                <v-card>
                  <v-card-title>
                    {{ t('profile.generate_access_token') }}
                  </v-card-title>
                  <v-card-text>
                    选择一个有效期，生成一个个人密钥，用于备份和恢复数据
                    <v-row>
                      <v-col>
                        密钥有效期至
                        {{ tokenExpiresAt?.toLocaleDateString() }}
                      </v-col>
                      <v-col>
                        <v-spacer />
                        <v-btn color="primary">
                          选择日期
                          <v-dialog activator="parent" max-width="330">
                            <template #default="{ isActive }">
                              <v-card>
                                <v-locale-provider locale="zhHans">
                                  <v-date-picker
                                    v-model="tokenExpiresAt"
                                    :max="
                                      new Date(
                                        Date.now() + 1000 * 60 * 60 * 24 * 60,
                                      )
                                    "
                                    :min="new Date()"
                                    show-adjacent-months
                                  ></v-date-picker>
                                </v-locale-provider>
                                <v-card-actions>
                                  <v-btn
                                    color="red"
                                    variant="outlined"
                                    @click="isActive.value = false"
                                  >
                                    关闭
                                  </v-btn>
                                </v-card-actions>
                              </v-card>
                            </template>
                          </v-dialog>
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col> 权限范围</v-col>
                      <v-col>
                        <v-select
                          v-model="tokenScopes"
                          :items="[
                            'me',
                            'me/update',
                            'me/*',
                            'backup',
                            'backup/onedrive',
                            'backup/*',
                          ]"
                          multiple
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn type="submit"> 生成</v-btn>
                  </v-card-actions>
                </v-card>
              </v-form>
              <v-card v-if="personalToken">
                <v-card-title>个人密钥</v-card-title>
                <v-card-text>
                  <v-alert color="error">
                    请妥善保管个人密钥，不要泄露给他人
                  </v-alert>
                  {{ personalToken }}
                </v-card-text>
                <v-card-actions>
                  <v-btn @click="personalToken = ''"> Close</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-btn>
          <v-btn
            :to="localePath('/x-backup/me')"
            class="text-none"
            color="secondary"
            rounded="lg"
            variant="outlined"
          >
            {{ t('profile.my_backup') }}
          </v-btn>
          <v-btn
            :to="localePath('/home/notifications')"
            class="text-none"
            color="secondary"
            rounded="lg"
            variant="outlined"
          >
            {{ t('message.list_title') }}
          </v-btn>
          <v-btn
            :to="localePath('/litematica/edit')"
            class="text-none"
            color="secondary"
            rounded="lg"
            variant="outlined"
          >
            {{ t('profile.post_management') }}
            <v-tooltip activator="parent" location="bottom">
              {{ t('profile.post_management_desc') }}
            </v-tooltip>
          </v-btn>
          <v-btn
            :to="
              isEarningPlanOk(user?.earningPlan)
                ? localePath('/litematica/earning-dashboard')
                : localePath('/litematica/earning')
            "
            v-if="locale === 'zh_cn'"
            class="text-none"
            color="success"
            rounded="lg"
            variant="outlined"
          >
            创作者收益看板
            <v-tooltip activator="parent" location="bottom">
              查看你的投影收益、结算与提现数据
            </v-tooltip>
          </v-btn>
        </div>
        <UserContentPanel
          v-if="machines"
          v-model:page="page"
          v-model:sort="sortType"
          :machines="machines.d"
          :totalPages="Math.ceil(machines.count / 12)"
          class="mt-4"
        />
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.gap-20 {
  gap: 20px;
}

.gap-8 {
  gap: 8px;
}
</style>
