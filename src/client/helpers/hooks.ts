import { useForceUpdate } from "framer-motion";

export function singletonHook<Hook extends (...args: any) => any>(
  hook: Hook,
  keyFromArgs: (...args: Parameters<Hook>) => string
): Hook {
  const cache = new Map<string, ReturnType<Hook>>();
  const listeners = new Set<Function>();
  const notify = () => {
    for (const fn of listeners) fn();
    // remove all listeners so they can register again
    listeners.clear();
  };

  const wrapperHook = (...args: Parameters<Hook>) => {
    const key = keyFromArgs(...args);
    const [update] = useForceUpdate();

    const cached = cache.get(key);
    // short-circuit and return the cache value
    if (cached !== undefined) {
      // register the listener
      listeners.add(update);

      return cached;
    }

    // get the updated value
    const result = hook(...Array.from(args)) as ReturnType<Hook>;
    // update the cache
    cache.set(key, result);
    // update all the other hooks
    notify();
    // return results
    return result;
  };

  return wrapperHook as Hook;
}
