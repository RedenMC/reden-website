export type Condition = (value: number) => boolean | string;

export function parseCondition(
  conditionString: string,
  t: (key: string, params?: any) => string,
): Condition {
  const minMatch = conditionString.match(/min\((\d+)\)/);
  if (minMatch) {
    const minValue = parseInt(minMatch[1], 10);
    const func = (value: number) =>
      value >= minValue ||
      t('litematica_generator.size_min', { size: minValue });
    func.min = minValue;
    return func;
  }

  const maxMatch = conditionString.match(/max\((\d+)\)/);
  if (maxMatch) {
    const maxValue = parseInt(maxMatch[1], 10);
    const func = (value: number) =>
      value <= maxValue ||
      t('litematica_generator.size_max', { size: maxValue });
    func.max = maxValue;
    return func;
  }

  const modMatch = conditionString.match(/mod\((\d+),(\d+)\)/);
  if (modMatch) {
    const modValue = parseInt(modMatch[1], 10);
    const remValue = parseInt(modMatch[2], 10);
    return (value: number) =>
      value % modValue === remValue ||
      t('litematica_generator.size_mod', {
        mod: modValue,
        rem: remValue,
      });
  }

  // Default checker
  return (value: number) => true; // Always return true if condition not matched.
}
