
import { h } from "vue";
import type { IconSet, IconProps } from "vuetify";
import DiscordIcon from "@/plugins/DiscordIcon.vue";

const customSvgNameToComponent: any = {
  DiscordIcon,
};

const customSVGs: IconSet = {
component: (props: IconProps) => h(customSvgNameToComponent[props.icon]),
};

export { customSVGs /* aliases */ };
