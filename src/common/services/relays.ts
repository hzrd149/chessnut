import { Relay, relayInit } from "nostr-tools";

const relays = new Map<string, Relay>();
export function getRelay(url: string) {
  if (!relays.has(url)) {
    const relay = relayInit(url);
    relays.set(url, relay);
    return relay;
  }
  return relays.get(url) as Relay;
}
