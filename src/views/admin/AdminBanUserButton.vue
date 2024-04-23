<script lang="ts" setup>
import { ref } from 'vue';
import { Profile } from '@/constants';
import { useAppStore } from '@/store/app';

const props = defineProps<{
  item: Profile;
}>();

const banReason = ref('Banned by ' + useAppStore().userCache?.username);
const banDays = ref(0);
const banHours = ref();
const banMinutes = ref();

function ban() {
  const duration =
    (banDays.value || 0) * 24 * 60 * 60 * 1000 +
    (banHours.value || 0) * 60 * 60 * 1000 +
    (banMinutes.value || 0) * 60 * 1000;
  // todo
  alert(
    `Banning ${props.item.username} for ${duration}ms with reason ${banReason.value}`,
  );
}
</script>

<template>
  <v-dialog max-width="500">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn
        color="red"
        icon="mdi-cancel"
        text="Ban"
        v-bind="activatorProps"
        variant="flat"
      />
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title>
          Ban
          <router-link :to="`/user/${item.id}`">
            {{ item.username }}</router-link
          >
        </v-card-title>

        <v-card-text>
          <template v-if="item.bannedUntil || 0 > Date.now()">
            <v-btn> Unban </v-btn>
          </template>
          <v-form v-else fast-fail @submit.prevent @submit="ban">
            <v-row>
              <v-col>
                <v-text-field
                  v-model="banReason"
                  dense
                  label="Reason"
                  outlined
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="banDays"
                  :rules="[(v: number) => v >= 0 || 'Invalid days']"
                  dense
                  label="Days"
                  outlined
                  type="number"
                />
              </v-col>
              <v-col>
                <v-combobox
                  :items="[0, 1, 12, 24]"
                  :rules="[
                    (v: number) => (v >= 0 && v < 30) || 'Invalid hours',
                  ]"
                  v-model="banHours"
                  dense
                  label="Hours"
                  outlined
                  type="number"
                />
              </v-col>
              <v-col>
                <v-combobox
                  :items="[0, 15, 30, 45]"
                  :rules="[
                    (v: number) => (v >= 0 && v < 60) || 'Invalid minutes',
                    () =>
                      banDays ||
                      banHours ||
                      banMinutes ||
                      'Must ban for at least 1 minute',
                  ]"
                  v-model="banMinutes"
                  dense
                  label="Minutes"
                  outlined
                  type="number"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-spacer />
              <v-btn color="red" text="Ban" type="submit" />
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn @click="isActive.value = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
