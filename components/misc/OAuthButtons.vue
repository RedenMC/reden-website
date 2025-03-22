<template>
  <div class="d-flex flex-column" style="gap: 8px">
    <v-btn
      :block="true"
      :href="'/api/oauth/github?redirect_url=' + encodeURI('/login')"
      variant="outlined"
      class="oauth"
      height="48"
    >
      <v-icon left>mdi-github</v-icon>
      <div class="text">Github</div>
    </v-btn>
    <v-btn
      :block="true"
      :href="'/api/oauth/microsoft?redirect_url=' + encodeURI('/login')"
      variant="outlined"
      class="oauth"
      height="48"
    >
      <v-icon left>custom:Microsoft</v-icon>
      <div class="text">Microsoft</div>
    </v-btn>
    <v-btn
      :block="true"
      :href="'/api/oauth/google?redirect_url=' + encodeURI('/login')"
      variant="outlined"
      class="oauth"
      height="48"
    >
      <v-icon left>custom:Google</v-icon>
      <div class="text">Google</div>
    </v-btn>
  </div>
</template>

<style scoped>
.oauth {
  height: 48px;
  font-size: 18px;
  text-transform: none;
}

.text {
  text-align: center;
  width: 120px;
}
</style>
<script setup lang="ts"></script>
