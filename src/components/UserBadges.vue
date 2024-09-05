<script setup lang="ts">
import { ref, watch } from 'vue';
import randomColor from 'randomcolor';
import { badgeDefs } from '@/constants';

const props = defineProps<{
  roles?: string[];
}>();

const badges = ref(
  props.roles?.map((role: string) => {
    if (!badgeDefs[role]) {
      badgeDefs[role] = {
        icon: '',
        translate: role,
        color: randomColor(),
      };
    }
    return badgeDefs[role]!;
  }),
);

watch(
  () => props.roles,
  (newVal) => {
    badges.value = newVal?.map((role: string) => badgeDefs[role]);
  },
);
</script>

<template>
  <div class="badges">
    <v-tooltip
      v-for="badge in badges"
      :key="badge.translate"
      location="bottom"
      :text="
        badge.hover_translate != null
          ? $t(badge.hover_translate)
          : $t(badge.translate)
      "
    >
      <template #activator="{ props }">
        <v-chip
          v-bind="props"
          :color="badge.color"
          :href="badge?.url"
          text-color="white"
        >
          <v-icon>{{ badge.icon }}</v-icon>
          {{ $t(badge.translate) }}
        </v-chip>
      </template>
    </v-tooltip>
  </div>
</template>

<style scoped>
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}
</style>
