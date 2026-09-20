const names: Record<string, string> = {
  tnt: 'TNT',
  glass: '玻璃',
  white_stained_glass: '白色染色玻璃',
  black_stained_glass: '黑色染色玻璃',
  white_concrete: '白色混凝土',
  gray_concrete: '灰色混凝土',
  redstone_wire: '红石粉',
  slime_block: '黏液块',
  piston: '活塞',
  sticky_piston: '黏性活塞',
  piston_head: '活塞头',
  observer: '侦测器',
  comparator: '红石比较器',
  repeater: '红石中继器',
  redstone_block: '红石块',
  redstone_torch: '红石火把',
  note_block: '音符盒',
  cherry_fence_gate: '樱花木栅栏门',
  dead_fire_coral_wall_fan: '失活的火珊瑚墙扇',
  powered_rail: '动力铁轨',
  activator_rail: '激活铁轨',
  composter: '堆肥桶',
  furnace: '熔炉',
  spruce_leaves: '云杉树叶',
  flower_pot: '花盆',
};
export function blockName(id: string, locale: string) {
  const key = id.replace('minecraft:', '');
  return locale.startsWith('zh') ? names[key] || key : key;
}
