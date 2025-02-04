<!-- components/MessageDetailDialog.vue -->
<template>

</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  message: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'close']);

const localShow = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

function closeDialog() {
  emit('update:modelValue', false);
  emit('close');
}
</script>
