<script setup lang="ts">

</script>
<script lang="ts">
import {doFetchGet} from "@/constants";

export default {
  name: 'OAuthMicrosoft',
  mounted() {
    doFetchGet('/api/oauth/microsoft/action/login').then(response => {
      if (response.ok) {
        response.json().then(data => {
          console.log(data)
          window.location.href = data['redirect']
        })
      } else {
        Promise.reject(response)
      }
    }).catch(reason => {
      console.log(reason)
    })
  },
}
</script>

<template>

</template>

<style scoped>

</style>
