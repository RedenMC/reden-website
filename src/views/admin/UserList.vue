<script setup lang="ts">
import {ref} from "vue";
import {doFetchGet, ErrorResponse} from "@/constants";
import {toast, VSonner} from "vuetify-sonner";

const page = ref(1)
const pageSize = ref(20)
const display = ref()

function refresh() {
  doFetchGet(`/api/admin/user/list?page=${page.value}&pageSize=${pageSize.value}`).then((res) => {
    if (res.ok) {
      return res.json()
    } else {
      Promise.reject(res.json())
    }
  }).then((data) => {
    console.log(data)
  }).catch((err: ErrorResponse) => {
    toast(err.error, {
      cardProps: {
        color: 'error'
      }
    })
    console.error(err)
  });
}
</script>

<template>
  <VSonner position="top-center" :expand="true"/>
</template>

<style scoped>

</style>
