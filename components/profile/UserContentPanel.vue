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
  <v-card :elevation="10" class="user-content-panel">
    <div class="profile-card-content">
      <v-card-title>
        <h2>{{ t('我的投影') }}</h2>
      </v-card-title>
      <v-card-text>
        <v-row v-if="displayedMachines.length" class="ma-n2">
          <v-col
            v-for="col in itemDisplayCols"
            :key="col.key"
            :cols="12 / itemsPerRow"
            align="start"
            justify="center"
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


@media (max-width: 600px) {
  .v-col {
    padding: 3px !important;
  }
}
</style>
