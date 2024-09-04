<script setup lang="ts">
import { ref, watch } from 'vue';
import randomColor from 'randomcolor';

type Def = {
  color: string;
  translate: string;
  hover_translate?: string;
  icon: string;
  url?: string;
};
const defs: { [keys: string]: Def } = {
  developer: {
    color: 'green',
    translate: 'user.developer',
    hover_translate: 'user.developer_hover',
    icon: 'mdi-code-tags',
  },
  contributor: {
    color: 'orange',
    translate: 'user.contributor',
    hover_translate: 'user.contributor_hover',
    icon: 'mdi-account-star',
  },
  staff: {
    color: 'blue',
    translate: 'user.staff',
    hover_translate: 'user.staff_hover',
    icon: 'mdi-account-tie',
  },
  sponsor: {
    color: 'purple',
    translate: 'user.sponsor',
    hover_translate: 'user.sponsor_hover',
    icon: 'mdi-account-heart',
    url: '/sponsors',
  },
};

type Props = {
  roles: string[] | undefined;
};

const props = defineProps<Props>();

const badges = ref(props.roles?.map((role: string) => {
  if (!defs[role]) {
    defs[role] = {
      icon: "",
      translate: role,
      color: randomColor()
    };
  }
  return defs[role]!
}));

watch(
  () => props.roles,
  (newVal) => {
    badges.value = newVal?.map((role: string) => defs[role]);
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
