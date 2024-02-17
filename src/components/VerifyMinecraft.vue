<script lang="ts" setup>
import {ref} from "vue";
import {doFetchGet, Profile} from "@/constants";
import {toast} from "vuetify-sonner";

const {user} = defineProps<{
  user: Profile | undefined
}>()
const status = ref('')
const verifyingMinecraft = ref(false)
const mustLinkMicrosoft = ref(false)

function verifyMinecraft() {
  verifyingMinecraft.value = true
  status.value = 'Checking Microsoft account...'
  // check ms
  doFetchGet("/api/account/microsoft").then(response => {
    if (response.ok) {
      status.value = 'Microsoft account checked, verifying Minecraft ownership...'
      doFetchGet("/api/account/minecraft/verify").then(response => {
        if (response.ok) {
          toast('Success', {
            description: 'Minecraft account verified',
            duration: 1000,
            cardProps: {
              color: 'green'
            }
          })
          status.value = 'Minecraft account verified, please refresh the page'
          window.location.reload()
          verifyingMinecraft.value = false
        } else if (response.status == 409) {
          status.value = 'Sorry, your Minecraft account already verified, please refresh the page'
          verifyingMinecraft.value = false
        } else {
          toast('Error', {
            description: 'Failed to verify minecraft account',
            duration: 1000,
            cardProps: {
              color: 'error'
            }
          })
          verifyingMinecraft.value = false
        }
      })
    } else {
      if (response.status == 404) {
        mustLinkMicrosoft.value = true
        status.value = 'You must link your microsoft account to verify minecraft account. ' +
          'We must be given permission to check your microsoft and minecraft account, if you do not trust this, ' +
          'please check out <a href="/minecraft/verify/in-game"> In-Game Verification</a> for more information'
        verifyingMinecraft.value = false
      } else {
        toast('Error', {
          description: 'Failed to check microsoft account',
          duration: 1000,
          cardProps: {
            color: 'error'
          }
        })
        verifyingMinecraft.value = false
      }
    }
  })
}
</script>

<template>
  <p class="minecraft">
    <v-icon>mdi-minecraft</v-icon>
    <span v-if="user?.mcUUID != null">
      Verified minecraft account

      <v-tooltip
        location="top"
        :text="`Verified as Minecraft UUID ${user.mcUUID}`"
      >
        <template #activator="{ props }">
          <v-icon v-bind="props" style="color: green">mdi-check-decagram</v-icon>
        </template>
      </v-tooltip>
    </span>
    <span v-else>
      No verified minecraft account linked
      <v-dialog width="500">
        <template v-slot:activator="{ props }">
          <v-btn
            color="primary"
            size="sm"
            v-bind="props"
            variant="plain"
            @click="verifyMinecraft"
          >
            Verify Now
          </v-btn>
        </template>

        <template v-slot:default="">
          <v-card
            :loading="verifyingMinecraft"
            title="Verify Minecraft"
          >
            <v-card-text v-html="status">
            </v-card-text>

            <v-card-actions>
              <v-spacer/>
              <v-btn
                v-if="mustLinkMicrosoft"
                color="primary"
                href="/api/oauth/microsoft"
              >
                Link Now
              </v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
    </span>
  </p>
</template>

<style scoped>

</style>
