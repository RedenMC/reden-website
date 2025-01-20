<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  machines?: any[];
}>();

const displayedMachines = computed(() => {
  return props.machines || [];
});
</script>

<template>
  <v-card :elevation="10" class="user-content-panel">
    <div class="profile-card-content">
      <v-card-title>
        <h2>{{ t('profile.user_content') }}</h2>
      </v-card-title>
      <v-card-text>
        <v-list v-if="displayedMachines.length">
          <v-list-item
            v-for="machine in displayedMachines"
            :key="machine.key"
            :title="machine.name"
            :subtitle="machine.summary"
          >
            <template #prepend>
              <v-icon>mdi-redstone</v-icon>
            </template>
            <template #append>
              <v-chip>{{ machine.downloads }} Downloads</v-chip>
            </template>
          </v-list-item>
        </v-list>

        <v-alert v-else type="info">
          {{ t('profile.no_machines') }}
        </v-alert>
      </v-card-text>
    </div>
  </v-card>
</template>

<style scoped>
.user-content-panel {
  margin: 20px;
  width: 100%;
  max-width: 800px;
  background: rgb(var(--v-theme-surface));
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.profile-card-content {
  padding: 16px;
}

.v-card-title h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 16px;
  color: rgb(var(--v-theme-on-surface));
}

.v-list {
  background: transparent;
}

.v-list-item {
  margin-bottom: 8px;
  border-radius: 4px;
  background: rgb(var(--v-theme-surface-lighten-1));
  transition: background 0.3s ease;
}

.v-list-item:hover {
  background: rgb(var(--v-theme-surface-lighten-2));
}

.v-icon {
  margin-right: 8px;
  color: rgb(var(--v-theme-primary));
}

.v-chip {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.v-alert {
  margin-top: 16px;
}
</style>
