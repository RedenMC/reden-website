<script lang="ts" setup>
const singleSelection: Ref<string | null> = ref(null);
const mainItems: Ref<SomeCustomObject[]> = ref([
  {
    mainItemId: 'someId',
    mainItemLabel: 'foo',
    subItems: [
      {
        name: 'bar',
      },
      {
        name: 'baz',
      },
    ],
  },
]);

function setSelect(mainId: string, subItemName: string): void {
  // Force the select box to display the selected item
  singleSelection.value = subItemName;

  // Do whatever custom things you need to with the values
  console.log(mainId, subItemName);
}
</script>

<template>
  <v-select v-model="singleSelection" :items="mainItems">
    <template v-slot:item="{ props, item }">
      <v-list lines="one" select-strategy="classic">
        <v-list-subheader>{{ item.raw.mainItemLabel }}</v-list-subheader>
        <v-list-item
          v-for="(subItem, index) in item.raw.subItems"
          :key="index"
          :value="`nestedList${index}`"
        >
          <v-list-item-title
            @click="() => setSelect(item.raw.mainItemId, subItem.name)"
            >{{ subItem.name }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </template>
  </v-select>
</template>

<style scoped></style>
