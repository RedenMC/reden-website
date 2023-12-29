<script setup lang="ts">

</script>

<script lang="ts">
import axios from 'axios'

export default {
  name: "Sponsors",
  data() {
    axios.get('/api/sponsors').then((res) => {
      this.sponsors = res.data
    })
    return {
      sponsors: []
    }
  }
}
</script>

<template>
  <h2>
    {{ $t('sponsors') }}
  </h2>
  <p>
    {{ $t('sponsors.description') }}
  </p>
  <v-list
    subheader
    three-line
    v-for="sponsor in sponsors"
    :key="sponsor.name"
  >
    <v-list-item>
      <v-list-item-title class="text-h6">{{ sponsor.name }}</v-list-item-title>
      <v-list-item-subtitle>{{ sponsor.description }}</v-list-item-subtitle>
      <v-list-item-action>
        <v-img :src="sponsor.avatar"/>
      </v-list-item-action>
    </v-list-item>
  </v-list>
</template>


<style scoped>

</style>
