<template>
  <div :class="props.class">
    <button @click="props.onClick" :type="props.type"
            class="relative w-full h-full px-4 pb-1 flex items-center justify-center shadow
            after:w-full after:h-2 after:absolute after:left-0 after:-bottom-2
            active:-bottom-1.5 active:after:h-0.5 active:after:-bottom-0.5"
            :class="themeNameFalse()">
      <slot />
    </button>
  </div>
</template>

<script setup lang="ts">



interface AuiButtonProps {
  theme?: "light" | "dark" | "success" | "error" | "danger" | "allow";
  class?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}
const props = defineProps<
  AuiButtonProps
>();
const themeNameFalse = () => {
  switch (props.theme) {
    case "light":
      return "bg-white hover:bg-neutral-200 after:bg-neutral-300 text-black";
    case "error":
      return "bg-red-500 hover:bg-red-600 after:bg-red-700 text-white";
    case "danger":
      return "bg-red-600 hover:bg-red-700 after:bg-red-800 text-white";
    case "success":
      return "bg-green-600 hover:bg-green-700 after:bg-green-800 text-white";
    case "allow":
      return "bg-green-500 hover:bg-green-600 after:bg-green-700 text-white";
    case "dark":
    default:
      return "bg-neutral-500 hover:bg-neutral-600 after:bg-neutral-700 text-white";
  }
};

</script>
