<script lang="ts" setup>
const localePath = useLocalePath();
</script>

<template>
  <v-container class="content-common">
    <v-row>
      <v-col>
        <v-card :to="localePath('/admin/users')" min-width="200">
          <v-card-title> User List </v-card-title>
        </v-card>
      </v-col>
      <v-col>
        <v-card href="/api/quark" min-width="200">
          <v-card-title> Quark </v-card-title>
          <v-card-text> Quark Maintenance </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
