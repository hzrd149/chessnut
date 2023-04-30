import { Filter, Sub } from "nostr-tools";
import { useEffect, useMemo } from "react";
import { getRelay } from "../../common/services/relays";
import useConnectedRelay from "./useConnectedRelay";

const cache = new Map<string, Sub>();
const subFilters = new Map<Sub, string>();
const claims = new Map<Sub, number>();

function getSub(url: string, id: string, filters: Filter[]) {
  const relay = getRelay(url);

  const cached = cache.get(id);
  if (cached) return cached;

  const sub = relay.sub(filters, { id });
  cache.set(id, sub);
  subFilters.set(sub, JSON.stringify(filters));
  return sub;
}

function claimSub(sub: Sub) {
  const n = claims.get(sub) ?? 0;
  claims.set(sub, n + 1);
}

function releaseSub(sub: Sub) {
  const n = claims.get(sub) ?? 1;
  claims.set(sub, n - 1);
}

export default function useRelaySub(
  url: string,
  id: string,
  filters: Filter[]
) {
  const relay = useConnectedRelay(url);
  const filterKey = JSON.stringify(filters);
  const sub = useMemo(() => getSub(url, id, filters), [relay]);

  // add and remove claims on sub
  useEffect(() => {
    claimSub(sub);
    return () => releaseSub(sub);
  }, [sub]);

  // update sub in the filter changes
  useEffect(() => {
    if (subFilters.get(sub) !== filterKey) {
      sub.sub(filters, { id });
      subFilters.set(sub, JSON.stringify(filters));
    }
  }, [filterKey]);

  return sub;
}

// cleanup subs with 0 claims
setInterval(() => {
  for (const [id, sub] of Array.from(cache)) {
    const count = claims.get(sub);
    if (count !== undefined && count <= 0) {
      sub.unsub();
      cache.delete(id);
      subFilters.delete(sub);
      claims.delete(sub);
    }
  }
}, 1000);

if (import.meta.env.DEV) {
  // @ts-ignore
  window.useRelaySub = {
    cache,
    subFilters,
    listeners: claims,
  };
}
