<script setup lang="ts">

</script>
<script lang="ts">
import {apiBaseUrl} from "@/constants";
import {useAppStore} from "@/store/app";

let user = fetch(apiBaseUrl + 'account/profile', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': useAppStore().csrfToken || ''
  },
  credentials: 'include',
  mode: 'cors'
}).then(async response => {
  if (response.ok) {
    let data: {
      username: string
      email: string
      id: number
    } = await response.json()
    return data
  } else {
    console.log(response)
    return {
      username: 'Error',
      email: 'Error',
      id: -1
    }
  }
})
export default {
  data() {
    return {
      user: user
    }
  },
}
</script>

<template>
<pre>
  {{JSON.stringify(user)}}
</pre>
</template>

<style scoped>

</style>
