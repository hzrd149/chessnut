import { Relay } from "nostr-tools";

export async function ensureConnected(relay: Relay) {
  if (relay.status !== WebSocket.OPEN) {
    await relay.connect();
  }
}
