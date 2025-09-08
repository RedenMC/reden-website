<script setup lang="ts">
import countup from 'vue3-countup';
import { useAppStore } from '~/store/app';
import { toast } from 'vuetify-sonner';
import { doFetchGet, doFetchPost } from '~/utils/constants';

const { Vue3Countup } = countup;
const downloads = ref(1000);
watch(downloads, (newValue) => {
  if (newValue < 0) {
    downloads.value = 0;
  } else if (newValue > 1000000) {
    downloads.value = 1000000;
  }
});

useSeoMeta({
  title: '创作者激励计划 - Reden',
  description:
    '在 Reden，创作即可获取收益。通过上传优质投影作品，您不仅可以分享创意，还能获得实际经济回报。',
});
const localePath = useLocalePath();
const appStore = useAppStore();

// 检查当前日期是否在2025年6月15日之后
const earningPlanEnabled = ref(false);
const earningApplicationStatus = ref('None'); // 可能的状态：None, PendingReview, PendingRealNameIdentity, Ok, Rejected, Disabled

onMounted(() => {
  const launchDate = new Date('2025-06-15');
  const today = new Date();
  earningPlanEnabled.value = today >= launchDate;

  // 获取用户申请状态
  if (appStore.logined) {
    fetchApplicationStatus();
  }
});

// 获取申请状态
async function fetchApplicationStatus() {
  try {
    const response = await doFetchGet('/api/account/earning/status');
    if (response.ok) {
      const data = await response.json();
      earningApplicationStatus.value = data.status || 'None';
    } else {
      toast.error('获取收益计划状态失败');
    }
  } catch (error) {
    toast.error('获取收益计划状态失败');
  }
}

// 申请收益计划
async function applyForEarningPlan() {
  if (!appStore.logined) {
    // 用户未登录，显示提示并跳转到登录页
    toast.error('请先登录再申请收益计划');
    return;
  }

  try {
    const response = await doFetchPost('/api/account/earning/enable', {});

    if (response.ok) {
      earningApplicationStatus.value = 'PendingReview';
      toast.success('申请已提交，我们将尽快审核');
    } else {
      toast.error(`申请失败: 请稍后重试`);
    }
  } catch (error) {
    console.error('申请收益计划失败', error);
    toast.error('申请提交失败，请稍后重试');
  }
}
</script>

<template>
  <div data-earning="yes" id="1111">
    <!-- 上面的 div 很重要，用来保证动画，所有内容必须包裹在其中 -->
    <div class="earning-page">
      <div class="hero-section">
        <div class="tech-overlay"></div>
        <div class="content-container">
          <v-icon size="48" class="mb-4 pulse-icon">mdi-cash-multiple</v-icon>
          <h1 class="tech-title">在 Reden，创作即可获取收益</h1>
          <p class="tech-description">
            通过上传优质投影作品，您不仅可以分享创意，还能获得实际经济回报。
            每次下载都会为您带来收益，我们定期结算并将收入发放给您。
          </p>
          <p class="opacity-60 text-body-1">
            *本活动自 2025 年 6 月 15 日起正式上线。
            申请通过后，所有上传的投影作品均可参与收益分成计划。
          </p>
        </div>
      </div>

      <div class="my-4 elevation-10 tech-card">
        <div class="section-title mt-8 ma-4">
          <v-icon left class="mr-2">mdi-calculator-variant</v-icon>
          收入计算器
        </div>
        <div class="calculator-content ma-4">
          <div class="input-section">
            <label class="tech-label">输入您作品的下载量/播放量</label>
            <v-text-field
              v-model="downloads"
              label="下载量/播放量"
              type="number"
              step="1"
              outlined
              class="mb-4 tech-input"
              prepend-icon="mdi-download-circle-outline"
              hide-details
            />
          </div>

          <div class="result-section">
            <div class="result-label">您的预估收入为：</div>
            <div class="result-amount">
              <Vue3Countup
                class="income-value"
                :number="downloads * 0.03149349"
                :more-options="{ suffix: '元', decimalPlaces: 2 }"
              />
            </div>
            <p class="disclaimer mt-2">
              预测数据仅供参考，代表正常情况下较高点赞率可获得的收益，实际收入可能会有所不同。我们会根据平台的整体收入情况和您的投影质量来计算最终的奖励。
            </p>
          </div>
        </div>
      </div>

      <h2 class="section-title my-4">
        常见问题 <v-icon>mdi-help-circle-outline</v-icon>
      </h2>

      <div class="faq-card elevation-6 tech-card">
        <v-expansion-panels variant="accordion" class="faq-panels pa-4">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex align-center qa-title">
                <v-icon class="mr-2">mdi-cloud-upload-outline</v-icon>
                我可以上传任何类型的投影吗？
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              我们鼓励上传原创和高质量的投影，确保内容符合社区标准。通过上传原创作品，您不仅能获得更多下载量，还能建立自己的创作者品牌。
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex align-center qa-title">
                <v-icon class="mr-2">mdi-calculator-variant</v-icon>
                收入是如何计算的？
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              收入基于下载量或播放量，具体比例会有所浮动。
              我们采用动态算法，考虑用户停留时间、作品质量评分和社区互动等多种因素，以确保优质创作获得更高回报。
              <span class="emphasis">
                从模组或API等非网站下载不会获得收入，中华人民共和国境外的下载也不会获得收入，敬请注意。
              </span>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex align-center qa-title">
                <v-icon class="mr-2">mdi-clock</v-icon>
                收入需要多长时间才能结算？
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              一般情况下，每个月的收入会在 +2
              月的第一周进行结算，比如，六月的下载收入会在八月结算。
              您可以在个人中心查看结算记录和预计收入。我们会确保结算过程透明且高效。
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex align-center qa-title">
                <v-icon class="mr-2">mdi-chart-bar</v-icon>
                如何查看我的收入？
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              您可以在个人中心查看您的收入统计。我们提供详细的数据分析，包括每日下载量、收入趋势图表和用户地域分布，帮助您优化创作策略。
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex align-center qa-title">
                <v-icon class="mr-2">mdi-delete-alert-outline</v-icon>
                如果我的投影被删除，我的收入会受到影响吗？
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              如果投影违反了社区标准或被举报，可能会导致收入暂停或取消。
              如果是您自己删除的投影，已经取得的收入将不会受到影响。
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex align-center qa-title">
                <v-icon class="mr-2">mdi-content-copy</v-icon>
                非原创作品能获得收益吗？
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              非原创作品只能获得原创作品收益的
              <span class="emphasis">四分之一</span>。
              此外，如果原作者入驻平台并认领作品，非原创上传者将无法继续获得相关收益。我们鼓励创作者上传原创内容，这不仅能获得更高的收益，也是对知识产权的尊重。
              将非原创作品上传到平台需要遵守相关法律法规，并确保不侵犯他人版权。我们会定期审核上传内容，确保平台内容的合法性和合规性。
              如果您将非原创作品标记为原创，可能会导致账号被封禁或取消收益资格的惩罚。
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex align-center qa-title">
                <v-icon class="mr-2">mdi-download</v-icon>
                用户下载是免费的吗？
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              是的，用户下载投影是免费的，但上传者可以通过下载量获得收入。
              我们通过广告以及其他合作方的支持来维持平台运营并支付奖励。
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex align-center qa-title">
                <v-icon class="mr-2">mdi-bank-transfer-out</v-icon>
                收益结算到哪个账号？有手续费吗？
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              首次领取收入时需要进行支付宝实名认证，认证费用1元由您承担。款项将会支付到您绑定的手机号对应的支付宝账号。
              请确保您填写的手机号与支付宝账号一致，以避免收款问题。如遇到任何结算相关的问题，请联系客服处理。
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <div class="tech-features mt-8">
        <div class="features-title">为什么选择 Reden？</div>
        <div class="features-grid">
          <div class="feature-item">
            <v-icon size="36" class="feature-icon">mdi-shield-check</v-icon>
            <div class="feature-text">
              <h3>版权保护</h3>
              <p>我们采用先进的技术保护您的创作，防止盗版和未授权使用</p>
            </div>
          </div>
          <div class="feature-item">
            <v-icon size="36" class="feature-icon">mdi-bank-transfer</v-icon>
            <div class="feature-text">
              <h3>快速结算</h3>
              <p>每月定期结算，资金直接转入您的账户，无需漫长等待</p>
            </div>
          </div>
          <div class="feature-item">
            <v-icon size="36" class="feature-icon"
              >mdi-chart-line-variant</v-icon
            >
            <div class="feature-text">
              <h3>数据分析</h3>
              <p>详细的数据分析助您了解作品表现，优化创作方向</p>
            </div>
          </div>
          <div class="feature-item">
            <v-icon size="36" class="feature-icon">mdi-account-group</v-icon>
            <div class="feature-text">
              <h3>社区支持</h3>
              <p>活跃的创作者社区，互相学习与合作的平台</p>
            </div>
          </div>
        </div>
      </div>

      <div class="cta-section mt-8">
        <v-btn
          class="start-btn"
          size="x-large"
          elevation="8"
          :to="localePath('/litematica#upload')"
          color="primary"
        >
          <v-icon left>mdi-rocket-launch</v-icon>
          开始上传您的投影
        </v-btn>
      </div>

      <!-- 收益计划申请区域 -->
      <div class="application-section my-8 elevation-10 tech-card">
        <div class="section-title mt-8 ma-4">
          <v-icon left class="mr-2">mdi-application-edit</v-icon>
          申请收益计划
        </div>
        <div class="application-content ma-4">
          <p class="application-description">
            加入我们的收益分成计划，您可以通过作品的下载量获得持续收益。
            申请简单，审核快速，帮助您更好地实现创作价值。
            有任何疑问请加QQ群：708842363
          </p>

          <div v-if="earningPlanEnabled" class="apply-form">
            <v-btn
              v-if="earningApplicationStatus === 'None'"
              class="apply-btn"
              size="large"
              elevation="8"
              @click="applyForEarningPlan"
              color="success"
            >
              申请加入收益计划
            </v-btn>

            <div
              v-else-if="earningApplicationStatus === 'PendingReview'"
              class="status-pending"
            >
              <v-progress-circular indeterminate size="24" class="mr-2" />
              <span>申请已提交，管理员审核中...</span>
            </div>

            <div
              v-else-if="earningApplicationStatus === 'Rejected'"
              class="status-rejected"
            >
              <v-icon class="mr-2" color="red">mdi-alert-circle</v-icon>
              <span>申请被拒绝</span>
            </div>

            <div
              v-else-if="earningApplicationStatus === 'Disabled'"
              class="status-disabled"
            >
              <v-icon class="mr-2" color="grey">mdi-block-helper</v-icon>
              <span>您的收益计划已被禁用</span>
              <v-btn
                class="ml-4"
                color="grey"
                variant="outlined"
                href="mailto:me@redenmc.com"
              >
                联系客服
              </v-btn>
            </div>
          </div>

          <div v-if="!earningPlanEnabled" class="date-restriction">
            <v-alert
              color="blue-grey"
              icon="mdi-clock-outline"
              variant="tonal"
              border="start"
              class="mx-auto"
              max-width="600"
            >
              <div class="text-h6 mb-2">收益计划即将开启</div>
              <p>收益计划将于2025年6月15日正式开启，届时您可以在此申请加入。</p>
            </v-alert>
          </div>

          <div
            v-if="
              earningApplicationStatus === 'PendingRealNameIdentity' ||
              earningApplicationStatus === 'Ok'
            "
            class="status-approved"
          >
            <v-icon class="mr-2" color="green">mdi-check-circle</v-icon>
            <span>申请已通过，您已成功加入收益计划！</span>
            <v-btn
              class="ml-4"
              color="success"
              variant="outlined"
              :to="localePath('/litematica/earning-dashboard')"
            >
              前往收益看板
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.emphasis {
  color: #f59e0b;
  font-weight: bold;
}

.earning-page {
  background-color: #0f172a;
  color: #e2e8f0;
  padding-bottom: 48px;
}

.hero-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 0 0 30px 30px;
  margin-bottom: 40px;
}

.tech-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
  z-index: 1;
}

.tech-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(
      circle at 20% 30%,
      rgba(65, 184, 131, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(52, 144, 220, 0.15) 0%,
      transparent 50%
    );
  z-index: -1;
}

.content-container {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 40px 20px;
}

.tech-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #41b883, #3490dc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(65, 184, 131, 0.3);
}

.tech-description {
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #cbd5e1;
}

.tech-card {
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.tech-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 15px 30px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(65, 184, 131, 0.2) !important;
}

.calculator-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px 0;
}

@media (min-width: 768px) {
  .calculator-content {
    flex-direction: row;
  }

  .input-section,
  .result-section {
    flex: 1;
  }
}

.tech-input {
  border-radius: 8px;
}

.tech-input :deep(.v-field__outline) {
  border-color: rgba(65, 184, 131, 0.3) !important;
}

.tech-input:hover :deep(.v-field__outline) {
  border-color: rgba(65, 184, 131, 0.6) !important;
}

.tech-label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #94a3b8;
}

.result-section {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(65, 184, 131, 0.2);
}

.result-label {
  font-size: 1.1rem;
  color: #94a3b8;
  margin-bottom: 8px;
}

.result-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
}

.income-value {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(90deg, #41b883, #3490dc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.disclaimer {
  font-size: 0.85rem;
  color: #64748b;
  font-style: italic;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.8rem;
  color: #e2e8f0;
}

.faq-panels :deep(.v-expansion-panel) {
  background: transparent;
  color: #e2e8f0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.faq-panels :deep(.v-expansion-panel-title) {
  padding: 16px;
  min-height: 64px;
}

.faq-panels :deep(.v-expansion-panel-text__wrapper) {
  padding: 0 16px 16px 48px;
  color: #94a3b8;
}

.tech-features {
  margin-top: 60px;
}

.features-title {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 32px;
  color: #e2e8f0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.feature-item {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.feature-item:hover {
  transform: translateY(-5px);
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(65, 184, 131, 0.3);
}

.feature-icon {
  color: #41b883;
}

.feature-text h3 {
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: #e2e8f0;
}

.feature-text p {
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.5;
}

.cta-section {
  text-align: center;
  margin-top: 60px;
}

.start-btn {
  font-size: 1.1rem;
  padding: 12px 32px;
  border-radius: 12px;
  background: linear-gradient(90deg, #41b883, #3490dc) !important;
  transition: all 0.3s ease;
  font-weight: 600;
}

.start-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(65, 184, 131, 0.4) !important;
}

.pulse-icon {
  animation: pulse 2s infinite;
  color: #41b883;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.tech-chart {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(65, 184, 131, 0.1);
}

.tech-chart::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(0deg, rgba(15, 23, 42, 0.8) 0%, transparent 100%);
  pointer-events: none;
}

.qa-title {
  font-size: 1.2rem;
  color: #e2e8f0;
  display: flex;
  align-items: center;
}

.application-section {
  margin-top: 60px;
}

.application-description {
  text-align: center;
  margin-bottom: 24px;
  color: #cbd5e1;
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.apply-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.apply-btn {
  padding: 12px 32px;
  font-size: 1.1rem;
  max-width: 400px;
  margin: 16px auto;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 600;
}

.apply-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(65, 184, 131, 0.4) !important;
}

.status-pending,
.status-approved,
.status-rejected,
.status-pending-identity,
.status-disabled {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-radius: 8px;
  margin: 16px auto;
  width: 100%;
  max-width: 500px;
  font-size: 1.1rem;
}

.status-pending {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.status-pending-identity {
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.3);
  color: #f97316;
}

.status-approved {
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: #34d399;
}

.status-rejected {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #f87171;
}

.status-disabled {
  background: rgba(156, 163, 175, 0.1);
  border: 1px solid rgba(156, 163, 175, 0.3);
  color: #9ca3af;
}

.status-rejected a {
  color: #f87171;
  text-decoration: underline;
  margin-left: 4px;
}

.date-restriction {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
}
</style>
