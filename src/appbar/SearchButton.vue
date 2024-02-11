<script lang="ts">
import { mergeProps } from 'vue'
import { toast } from 'vue-sonner'

const items: {
  title: string
  preview?: string
  action?: () => void
}[] = [
  { title: 'R-Debugger' },
  { title: 'Undo & Redo' },
  { title: 'Super Right' },
  { title: 'Other Server Side Features', preview: 'AAA' },
  { title: 'Other Client Side Features', preview: 'AAA' },
]

for (const item of items) {
  item.preview = item.preview || item.title
  item.action = () => {
    toast(item.title, {
      description: item.preview,
    })
  }
}

export default {
  data() {
    return {
      searchText: '',
      items,
    }
  },
  watch: {
    searchText(val) {
      this.items = items.filter((item) => {
        return item.title.toLowerCase().includes(val.toLowerCase())
      })
    },
  },
  methods: {
    mergeProps,
    checkEnter(e) {
      if (e.key === 'Enter')
        this.items[0].action()
    },
  },
}
</script>

<template>
  <div class="text-center">
    <v-menu
      :close-on-content-click="false"
      transition="scale-transition"
    >
      <template #activator="{ props: menu }">
        <v-tooltip location="top" transition="scale-transition">
          <template #activator="{ props: tooltip }">
            <v-btn
              v-bind="mergeProps(menu, tooltip)"
              icon="mdi-magnify"
            />
          </template>
          <span> {{ $t('search.hover') }} </span>
        </v-tooltip>
      </template>
      <v-list width="500">
        <v-list-item>
          <v-text-field
            v-model="searchText"
            placeholder="Search"
            clear-icon="mdi-close-circle-outline"
            :clearable="true"
            @click:clear="searchText = ''"
            @keydown="checkEnter(this)"
          />
        </v-list-item>
        <v-list-item
          v-for="(item, index) in items"
          :key="index"
          @click="item.action"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
          <v-list-item-subtitle v-if="item.preview">
            {{ item.preview }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>
