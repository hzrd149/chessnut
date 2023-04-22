import { Filter, Sub } from "nostr-tools";
import { useEffect, useState } from "react";
import { ensureConnected, getRelay } from "../services/relays";

export function useRelaySub(key: string, url: string, filters: Filter[]) {
  const [sub, setSub] = useState<Sub>();

  useEffect(() => {
    (async () => {
      const relay = getRelay(url);
      await ensureConnected(relay);
      setSub(relay.sub(filters, { id: key }));
    })();
    // only watch the key and url. since the filter will be a new instance every render
  }, [url, key]);

  return sub;
}
