import { Event, Filter, SubscriptionOptions } from "nostr-tools";
import useConnectedRelay from "./useConnectedRelay";
import { useEffect, useState } from "react";

export default function useSingleEvent(
  url: string,
  filter: Filter,
  opts?: SubscriptionOptions
) {
  const relay = useConnectedRelay(url);
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (relay) {
      relay.get(filter, opts).then((e) => e && setEvent(e));
    }
  }, [relay]);

  return event;
}
