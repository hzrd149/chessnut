import { Relay, relayInit } from "nostr-tools";
import { WebSocket } from "ws";

// @ts-ignore
global.WebSocket = WebSocket;

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
