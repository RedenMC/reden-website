<script setup lang="ts">
import {Ref, ref} from "vue";
import {doFetchGet, ErrorResponse, Profile} from "@/constants";
import {toast} from "vuetify-sonner";

const pageSize = ref(20)
const totalItems = ref(0)
const serverItems: Ref<Profile[]> = ref([])
const loading = ref(false)
const search = ref('')
async function loadItems(options: { page: number, itemsPerPage: number, sortBy: string[], sortDesc: boolean[] }) {
  loading.value = true
  console.log('loadItems', options)
  const response = await doFetchGet(`/api/admin/user/list?page=${options.page}&pageSize=${options.itemsPerPage}&sort=${options.sortBy[0]}&order=${options.sortDesc[0] ? 'desc' : 'asc'}&search=${search.value}`)
  if (response.ok) {
    const data: {
      users: Profile[],
      total: number
    } = await response.json()
    serverItems.value = data.users
    totalItems.value = data.total
  } else {
    const error: ErrorResponse = await response.json()
    toast('Error', {
      description: error.error,
      duration: 10000,
      cardProps: {
        color: 'error'
      }
    })
  }
  loading.value = false
}
const headers = [
  {title: 'Name', key: 'name'},
  {title: 'Email', key: 'email'},
  {title: 'Role', key: 'role'},
  {title: 'Created At', key: 'createdAt'},
  {title: 'Updated At', key: 'updatedAt'},
  {title: 'Actions', key: 'actions', sortable: false}
]
</script>

<template>
  <v-data-table-server
    v-model:items-per-page="pageSize"
    :headers="headers"
    :items-length="totalItems"
    :items="serverItems"
    :loading="loading"
    :search="search"
    item-value="name"
    @update:options="loadItems"
  ></v-data-table-server>
</template>

<style scoped>

</style>
