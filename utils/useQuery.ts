import { useRoute, useRouter } from '#vue-router';
import { customRef, nextTick, toValue, watch } from 'vue';

const _queue = new WeakMap();
export function redenUseQuery<T>(
  name: string,
  defaultValue?: T,
  options: any = {},
): globalThis.Ref<T, T> {
  const {
    mode = 'replace',
    route = useRoute(),
    router = useRouter(),
    transform,
  } = options;
  let transformGet = (value: any) => value;
  let transformSet = (value: any) => value;
  if (typeof transform === 'function') {
    transformGet = transform;
  } else if (transform) {
    if (transform.get) transformGet = transform.get;
    if (transform.set) transformSet = transform.set;
  }
  if (!_queue.has(router)) _queue.set(router, /* @__PURE__ */ new Map());
  const _queriesQueue = _queue.get(router);
  let query = route.query[name];
  let initialRoute = route.name;
  console.log('initialRoute', initialRoute);
  tryOnScopeDispose(() => {
    query = void 0;
  });
  let _trigger: () => void;
  const proxy = customRef((track, trigger) => {
    _trigger = trigger;
    return {
      get() {
        track();
        return transformGet(query !== void 0 ? query : toValue(defaultValue));
      },
      set(v) {
        v = transformSet(v);
        if (query === v) return;
        query = v === toValue(defaultValue) ? void 0 : v;
        _queriesQueue.set(name, v === toValue(defaultValue) ? void 0 : v);
        trigger();
        nextTick(() => {
          if (_queriesQueue.size === 0) return;
          const newQueries = Object.fromEntries(_queriesQueue.entries());
          _queriesQueue.clear();
          const { params, query: query2, hash } = route;
          router[toValue(mode)]({
            params,
            query: { ...query2, ...newQueries },
            hash,
          });
        });
      },
    };
  });
  watch(
    () => route.query[name],
    (v) => {
      if (query === transformGet(v)) return;
      query = v;
      _trigger();
    },
    { flush: 'sync' },
  );
  return proxy;
}
