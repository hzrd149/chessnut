import { Event, Filter, SubscriptionOptions } from "nostr-tools";
import useConnectedRelay from "./useConnectedRelay";
import { useEffect, useState } from "react";

const cache = new Map<string, Event>();

export default function useSingleEvent(
  url: string,
  filter: Filter,
  opts?: SubscriptionOptions
) {
  const relay = useConnectedRelay(url);
  const [event, setEvent] = useState<Event | undefined>(
    cache.get(JSON.stringify(filter))
  );

  useEffect(() => {
    if (relay && !event) {
      relay.get(filter, opts).then((e) => {
        if (e) {
          cache.set(JSON.stringify(filter), e);
          setEvent(e);
        }
      });
    }
  }, [relay, event]);

  return event;
}

if (import.meta.env.DEV) {
  //@ts-ignore
  window.useSingleEvent = {
    cache,
  };
}
