
import { h } from "vue";
import type { IconSet, IconProps } from "vuetify";
import discordIcon from "./discordIcon.vue";

const customSvgNameToComponent: any = {
  discordIcon,
};

const customSVGs: IconSet = {
component: (props: IconProps) => h(customSvgNameToComponent[props.icon]),
};

export { customSVGs /* aliases */ };
