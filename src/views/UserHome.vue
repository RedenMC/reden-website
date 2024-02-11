<script setup lang="ts">

</script>
<script lang="ts">
import {doFetchGet} from "@/constants";
import {ref} from "vue";

type response = {
  username: string
  email: string
  id: number
}
let user = ref<response>()
doFetchGet('/api/account/profile').then(async response => {
  if (response.ok) {
    user.value = await response.json()
  } else {
    console.log(response)
    await Promise.reject(response.json())
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
  {{JSON.stringify(user, null, 2)}}
</pre>
</template>

<style scoped>

</style>
