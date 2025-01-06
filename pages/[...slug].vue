<script lang="ts" setup>
import { ref } from 'vue';
import { useDisplay, useGoTo } from 'vuetify';

const goTo = useGoTo();
const drawer = ref(false);

const { mdAndDown, lgAndUp } = useDisplay();
const goToDocs = async (id: string) => {
  debugger;
  await goTo(`#${id}`, {
    offset: 300,
    duration: 1e3,
    container: '#passage-container',
  });
  drawer.value = !mdAndDown.value;
};
definePageMeta({
  layout: false,
});
</script>

<template>
  <ContentDoc v-slot="{ doc }">
    <NuxtLayout name="default">
      <template #sidebars>
        <v-navigation-drawer
          v-model="drawer"
          :temporary="mdAndDown"
          mobile-breakpoint="md"
        >
          Table of Contents
          <ul>
            <li v-for="link of doc?.body?.toc?.links" :key="link.id">
              <a :href="`#${link.id}`" @click.prevent="goToDocs(link.id)">{{
                link.text
              }}</a>
              <ul>
                <li v-for="link1 of link.children" :key="link1.id">
                  <a
                    :href="`#${link1.id}`"
                    @click.prevent="goToDocs(link.id)"
                    >{{ link1.text }}</a
                  >
                </li>
              </ul>
            </li>
          </ul>
        </v-navigation-drawer>
      </template>
      <template #default>
        <ContentRenderer id="passage-container" :value="doc" />
      </template>
    </NuxtLayout>
  </ContentDoc>
</template>

<style scoped>
#passage-container {
  padding: 0 16px;
  max-width: 800px;
  margin: 0 auto;
}

ul {
  padding-inline-start: 16px;
}

.top-64 {
  top: 64px;
}

.top-100 {
  top: 100px;
}
</style>
