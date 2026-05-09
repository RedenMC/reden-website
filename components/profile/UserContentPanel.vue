<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import MinecraftFarmCard from '@/components/litematica/MinecraftFarmCard.vue';
import { useDisplay } from 'vuetify';

const { t } = useI18n();

const props = defineProps<{
  machines?: any[];
  page?: number;
  totalPages: number;
  sort?: ProfilePostSort;
}>();

const { width } = useDisplay();

const page = ref(props.page || 1);

const emits = defineEmits<{
  'update:page': [number];
  'update:sort': [ProfilePostSort];
}>();

type ProfilePostSort = 'createdAt' | 'downloads';

const sortTypes: ProfilePostSort[] = ['createdAt', 'downloads'];
const sortType = computed<ProfilePostSort>({
  get: () => props.sort ?? 'createdAt',
  set: (value) => emits('update:sort', value),
});

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
  <v-card :elevation="4" border>
    <div class="profile-card-content">
      <v-card-title class="profile-posts-title">
        <h2>{{ t('profile.posts') }}</h2>
        <div class="sort-actions">
          <span class="sort-label">
            {{ t('profile.sort.sort_by') }}
          </span>
          <v-btn
            v-for="sort in sortTypes"
            :key="sort"
            :active="sortType === sort"
            class="text-none"
            color="secondary"
            variant="text"
            @click="sortType = sort"
          >
            {{ t(`profile.sort.${sort}`) }}
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <v-row justify="center">
          <v-pagination
            v-if="totalPages > 1"
            v-model="page"
            :length="totalPages"
            :total-visible="Math.min(8, width / 80 - 2)"
            rounded="xl"
            size="32"
            @update:modelValue="(value) => emits('update:page', value)"
          />
        </v-row>
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
        <v-row justify="center">
          <v-pagination
            v-if="totalPages > 1"
            v-model="page"
            :length="totalPages"
            :total-visible="Math.min(8, width / 80 - 2)"
            rounded="xl"
            size="32"
            @update:modelValue="(value) => emits('update:page', value)"
          />
        </v-row>
        <v-alert v-if="!displayedMachines.length" type="info">
          {{ t('profile.no_machines') }}
        </v-alert>
      </v-card-text>
    </div>
  </v-card>
</template>

<style scoped>
.profile-posts-title {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  justify-content: space-between;
}

.sort-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.sort-label {
  font-size: 0.875rem;
  line-height: 36px;
}
</style>
