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
  <v-card :elevation="10" class="">
    <div class="profile-card-content">
      <v-card-title>
        <h2>{{ t('用户内容') }}</h2>
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
              hide-author-info
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
