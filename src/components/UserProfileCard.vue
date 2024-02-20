<script setup lang="ts">
import {ref, VueElement} from "vue";
import {fetchUser, Profile} from "@/constants";
import UserBadges from "@/components/UserBadges.vue";
import VerifyMinecraft from "@/components/VerifyMinecraft.vue";

let user = ref<Profile>()
fetchUser(user)

defineSlots<{
  actions: VueElement[] | undefined
}>()

</script>
<template>
  <v-card
      :elevation="10"
      class="profile-card"
  >
    <div class="profile-card-content">
      <div class="user-avatar-border">
        <v-avatar
            :image="user?.avatarUrl"
            :size="200"
        />
      </div>
      <h1 class="user-name">
        {{ user?.username }}
      </h1>
      <UserBadges :roles="user?.roles"/>
      <p v-if="user?.id != null" class="user-id">
        <v-icon class="profile-item-icon">mdi-account</v-icon>
        <span>uid: {{ user?.id }}</span>
      </p>
      <p v-if="user?.email != null" class="user-email">
        <v-icon class="profile-item-icon">mdi-email</v-icon>
        <a class="link" :href="'mailto:' + user?.email"> {{ user?.email }} </a>
        <v-icon>mdi-warning</v-icon>
      </p>
      <p class="minecraft">
        <v-icon class="profile-item-icon">mdi-minecraft</v-icon>
        <VerifyMinecraft :user="user"/>
      </p>
      <p class="user-github">
        <v-icon class="profile-item-icon">mdi-github</v-icon>
        <span v-if="user?.githubId != null">
          <a class="link" :href="'//github.com/' + user.githubId"> {{ user!.githubId }} </a>
        </span>
        <span v-else>
          Account not linked
          <a
              href="/api/oauth/github?redirect_url=/home"
          >
            Link Now
          </a>
        </span>
      </p>
      <slot name="actions" />
    </div>
  </v-card>
</template>
<style scoped>
.profile-card {
  margin: 20px;
  width: 300px;
}

.user-name {
  text-align: center;
  font-size: 2em;
  margin: 0;
  padding: 0;
  font-weight: bold;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
}

p {
  color: #cccccc;
}

a.link {
  color: #cccccc;
  text-decoration: none;
  transition: all 0.5s;
}

a:hover.link {
  color: #eeeeee;
  text-decoration: underline;
  transition: all 0.5s;
}

.profile-card-content {
  padding: 16px;
}

.user-avatar-border {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.profile-item-icon {
  margin-right: 6px;
}
</style>
