<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { doFetchGet } from '~/utils/constants';
import { useAppStore } from '~/store/app';
import { toast } from 'vuetify-sonner';

const appStore = useAppStore();
const loading = ref(false);
const stat = ref({
  count: 0, // 有效下载数
  pendingCount: 0, // 冻结中下载数
  invalidCount: 0, // 无效下载数
  totalPending: 0,
  totalPaid: 0,
  totalAvailable: 0,
});
useSeoMeta({
  title: '创作者收益看板 - Reden',
  description:
    '查看您的创作者收益数据，在 Reden，您可以轻松管理和查看您的创作者收益情况。',
});

const fetchStat = async () => {
  if (!appStore.logined) {
    toast.error('请先登录后查看创作者收益数据');
    return;
  }
  loading.value = true;
  try {
    const res = await doFetchGet('/api/mc-services/litematica/earning/my-stat');
    if (res.ok) {
      const data = await res.json();
      stat.value = data;
    } else {
      toast.error('获取收益数据失败');
    }
  } catch (e) {
    toast.error('获取收益数据失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStat();
});

const formatAmount = (n: number) => n.toFixed(2);
const formatCount = (n: number) => n.toLocaleString();

const tips = '冻结中金额将在60天后自动解禁，解禁后可提现。若有疑问请联系客服。';
</script>

<template>
  <div class="earning-dashboard-page">
    <h1 class="dashboard-title">
      <v-icon class="mr-2">mdi-view-dashboard</v-icon>
      创作者收益看板
    </h1>
    <v-alert v-if="!appStore.logined" type="warning" class="mb-6">
      请先登录后查看您的收益数据。
    </v-alert>
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-4"
    />
    <div v-if="appStore.logined && !loading" class="dashboard-grid">
      <div class="dashboard-card">
        <div class="card-label">有效下载次数（估计）</div>
        <div class="card-value">{{ formatCount(stat.count) }}</div>
      </div>
      <div class="dashboard-card">
        <div class="card-label">冻结中下载数（估计）</div>
        <div class="card-value text-blue-grey">
          {{ formatCount(stat.pendingCount) }}
        </div>
      </div>
      <div class="dashboard-card">
        <div class="card-label">无效下载数（估计）</div>
        <div class="card-value text-grey">
          {{ formatCount(stat.invalidCount) }}
        </div>
      </div>
      <div class="dashboard-card">
        <div class="card-label">冻结中金额（估计）</div>
        <div class="card-value text-blue-grey">
          ￥{{ formatAmount(stat.totalPending) }}
        </div>
        <v-tooltip activator="parent" open-on-click>
          冻结金额是合作商还没有支付给 Reden 平台的部分，<br />
          这部分金额将在60天后自动解禁，解禁后可提现。<br />
          此金额仅为估计，实际金额可能会有变动。
        </v-tooltip>
      </div>
      <div class="dashboard-card">
        <div class="card-label">待提现金额</div>
        <div class="card-value text-green">
          ￥{{ formatAmount(stat.totalAvailable) }}
        </div>
      </div>
      <div class="dashboard-card">
        <div class="card-label">已支付金额</div>
        <div class="card-value text-orange">
          ￥{{ formatAmount(stat.totalPaid) }}
        </div>
      </div>
    </div>
    <div class="dashboard-tips mt-6">
      <v-icon class="mr-1" size="18">mdi-information-outline</v-icon>
      {{ tips }}
    </div>
  </div>
</template>

<style scoped>
.earning-dashboard-page {
  max-width: 800px;
  margin: 40px auto;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border-radius: 18px;
  padding: 32px 24px 40px 24px;
  color: #e2e8f0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}
.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  color: #e2e8f0;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 28px;
}
.dashboard-card {
  background: rgba(30, 41, 59, 0.7);
  border-radius: 12px;
  padding: 28px 18px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(65, 184, 131, 0.08);
  border: 1px solid rgba(65, 184, 131, 0.08);
}
.card-label {
  font-size: 1.1rem;
  color: #94a3b8;
  margin-bottom: 10px;
}
.card-value {
  font-size: 2.1rem;
  font-weight: 700;
  margin-bottom: 2px;
}
.text-blue-grey {
  color: #60a5fa;
}
.text-green {
  color: #34d399;
}
.text-orange {
  color: #f59e42;
}
.text-grey {
  color: #a3a3a3;
}
.dashboard-tips {
  margin-top: 32px;
  color: #94a3b8;
  font-size: 1rem;
  display: flex;
  align-items: center;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 8px;
  padding: 12px 18px;
}
</style>
