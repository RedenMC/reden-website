const KEY = "reden:referrer";

export function useReferrer() {
  function get(): string | null {
    if (import.meta.server) return null;
    return sessionStorage.getItem(KEY);
  }

  const referrer = computed<string | null>(() => get());

  return { referrer, get };
}
