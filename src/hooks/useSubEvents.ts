import { Event, Sub } from "nostr-tools";
import { useEffect, useState } from "react";

export default function useSubEvents(sub: Sub) {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const listener = (event: Event) => {
      setEvents((arr) => arr.concat(event));
    };
    sub.on("event", listener);
    return () => sub.off("event", listener);
  }, [sub]);

  return events;
}
