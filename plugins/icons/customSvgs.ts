import { h } from 'vue';
import type { IconSet, IconProps } from 'vuetify';
import DiscordIcon from '@/plugins/icons/DiscordIcon.vue';
import ModrinthFull from '@/plugins/icons/ModrinthFull.vue';

const customSvgNameToComponent: Record<any, any> = {
  DiscordIcon,
  ModrinthFull,
};

const customSVGs: IconSet = {
  component: (props: IconProps) =>
    h(customSvgNameToComponent[props.icon as string]),
};

export { customSVGs /* aliases */ };
