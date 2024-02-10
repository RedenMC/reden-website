<script setup lang="ts">

</script>
<script lang="ts">
import {apiBaseUrl} from "@/constants";

export default {
  name: 'OAuthMicrosoft',
  mounted() {
    fetch(apiBaseUrl + 'oauth/microsoft/action/login', {
      method: 'GET',
      credentials: 'include',
    }).then(response => {
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
