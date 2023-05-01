import { Pub, Relay, relayInit } from "nostr-tools";

const relays = new Map<string, Relay>();
export function getRelay(url: string) {
  if (!relays.has(url)) {
    const relay = relayInit(url);
    relays.set(url, relay);
    return relay;
  }
  return relays.get(url) as Relay;
}
export async function ensureConnected(relay: Relay) {
  if (relay.status !== WebSocket.OPEN) {
    await relay.connect();
  }
}
export async function waitForPub(pub: Pub) {
  return new Promise((res, rej) => {
    pub.on("ok", res);
    pub.on("failed", rej);
  });
}
