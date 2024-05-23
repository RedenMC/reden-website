<script setup lang="ts"></script>

<template>
  <v-row>
    <v-col>
      <h1>Reden Version Control</h1>
      <p class="content-common">
        aka. RVC, is a powerful version control system for Minecraft based on
        <a href="https://git-scm.com/" target="_blank">Git</a>.
      </p>
    </v-col>
  </v-row>

  <div class="content-common">
    <v-row>
      <v-col class="section">
        <h3>Share with the World</h3>

        <p>
          RVC helps you to share your creation to Github, and collaborate with
          other players.
        </p>
      </v-col>
      <v-col class="section">
        <h3>Go ahead, make a change</h3>

        <p>
          RVC can help you to track changes, and revert to any previous state.
          RVC allows you
        </p>
      </v-col>
      <v-col class="section">
        <h3>Sharing can be so easy</h3>

        <p>Share your machine with a link to Github.</p>
      </v-col>
      <v-col class="section">
        <h3>Together with the community</h3>

        <p>
          RVC can help you to collaborate with other players. Players can fork
          your machine, and make changes. Then you can merge them back, thus,
          their improvements can be shared with the you back.
        </p>

        <p>
          Players can also "star" your machine, so that they can find it easily.
          The more stars, the more popular your machine is.
        </p>
      </v-col>
    </v-row>
    <v-row class="text-center">
      <v-col>
        <v-btn to="/download" color="primary" rounded> Download Reden </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
  font-size: 2.5rem;
  margin-top: 2rem;
}

h2 {
  text-align: center;
  font-size: 2rem;
  margin-top: 2rem;
}

h3 {
  text-align: center;
  font-size: 1.5rem;
  margin-top: 2rem;
}

.section {
  margin-top: 2rem;
  min-width: 300px;
}
</style>
