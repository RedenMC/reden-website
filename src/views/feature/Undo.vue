<script setup lang="ts">
</script>

<template>
  <v-sheet>
    <h2 class="title1">Ctrl+Z Once, Undo Everything</h2>
    <v-col>
      <h3 class="title2">Undo for <b class="everything">Everything</b></h3>
      <p>
        Reden provides a powerful undo feature that can undo almost everything in Minecraft.
      </p>
      <p>
        Reden can undo:
      </p>
      <v-row class="text-center content-common">
        <v-col>
          <img src="@/assets/homepage/undo/grass_block.webp" alt="Undo for blocks" />
          <p>Blocks</p>
        </v-col>
        <v-col class="">
          <img src="@/assets/homepage/undo/villager.webp" alt="Undo for entities" />
          <p>Entities</p>
        </v-col>
        <v-col>
          <img src="@/assets/homepage/undo/chest.png" alt="Undo for items" />
          <p>Items</p>
        </v-col>
        <v-col>
          <img src="@/assets/homepage/undo/TNT.webp" alt="Undo for tnt" />
          <p>TNTs</p>
        </v-col>
      </v-row>
    </v-col>

    <h3 class="title2">Multiplayer Support</h3>
    <p>
      Undo can only be used in creative mode.
      It requires to be installed on server-side to work, and on clients to use the hotkey.
    </p>
    <p>
      In a server, each player can undo their own actions. Server admins can set the maximum undo RAM usage,
      so that the server won't run out of memory.
    </p>
    <h3 class="title2">Chain Reactions</h3>
    <p>
      Undo can undo chain reactions, such as TNT explosions, and undo the whole explosion.
    </p>

    <h3 class="title2">Vanilla, but more</h3>
    <p>
      Reden keeps your game vanilla, it will not change any game mechanics.
    </p>
    <p>
      Reden can run on clients or servers, you can install it without any overhead.
    </p>
    <p>
      Reden supports undo for many other mods, such as Litematica.
    </p>
  </v-sheet>
  <v-row class="text-center">
    <v-col>
      <v-btn
        to="/download"
        color="primary"
        rounded
      >
        Download Reden
      </v-btn>
    </v-col>
  </v-row>
</template>

<style scoped>
.title1 {
  text-align: center;
  font-size: 2.5rem;
  margin-top: 2rem;
}

.title2 {
  text-align: center;
  font-size: 2rem;
  margin-top: 2rem;
}

.main-desc {
}

.everything {
  color: #f44336;
}

img {
  width: 100px;
  margin: 0 auto;
}
</style>
