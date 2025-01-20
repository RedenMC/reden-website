<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import MinecraftFarmCard from '@/components/litematica/MinecraftFarmCard.vue';
import { useDisplay } from 'vuetify';

const { t } = useI18n();

const props = defineProps<{
  machines?: any[];
}>();

const displayedMachines = computed(() => {
  return props.machines || [];
});

const { xs, sm, md } = useDisplay({
  mobileBreakpoint: 600,
});

const itemsPerRow = computed(() =>
  xs.value ? 1 : sm.value || md.value ? 2 : 3,
);

interface Column {
  def: any[];
  key: string;
}

const itemDisplayCols = computed<Column[]>(() => {
  const cols: Column[] = [];
  for (let i = 0; i < itemsPerRow.value; i++) {
    cols.push({ def: [], key: `col-${i}` });
  }
  displayedMachines.value.forEach((machine, index) => {
    cols[index % itemsPerRow.value].def.push(machine);
  });
  return cols;
});
</script>

<template>
  <v-card :elevation="10" variant="flat" class="flex-1-1-0">
    <div class="profile-card-content">
      <v-card-title>
        <h2>{{ t('我的投影') }}</h2>
      </v-card-title>
      <v-card-text>
        <v-list v-if="displayedMachines.length">
          <v-list-item
            v-for="machine in displayedMachines"
            :key="machine.key"
            :title="machine.name"
            :subtitle="machine.summary"
          >
            <MinecraftFarmCard
              v-for="machine in col.def"
              :key="machine.key"
              :item="machine"
              class="mt-4"
            />
          </v-col>
        </v-row>

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
