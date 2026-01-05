/**
 * Composable for i18n translation helper
 * Provides a simple translation function that works in all contexts
 */
export const useI18nHelper = () => {
  const $t = (key: string) => {
    const i18n = useNuxtApp().$i18n;
    return i18n?.t(key) || key;
  };

  return { $t };
};
