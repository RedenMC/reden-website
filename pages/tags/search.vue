<script setup lang="ts">
const searchText = useRouteQuery<string>('search');
const {
  data: results,
  refresh,
  status,
} = useFetch<{
  total: number;
  data: any[];
}>(() => `/api/mc-services/tags?search=${searchText.value}`, {});

watch(results, (newValue) => {
  if (newValue?.data) {
    console.log('Search results:', newValue.data);
  }
});
</script>

<template>
  <div>
    <v-text-field v-model="searchText" />

    <v-data-table :items="results?.data || []"> </v-data-table>
  </div>
</template>

<style scoped></style>
