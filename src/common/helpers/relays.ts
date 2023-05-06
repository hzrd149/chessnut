import { Pub, Relay } from "nostr-tools";

export async function waitForPub(pub: Pub) {
  return new Promise((res, rej) => {
    pub.on("ok", res);
    pub.on("failed", rej);
  });
}

export async function ensureConnected(relay: Relay) {
  if (relay.status !== WebSocket.OPEN) {
    await relay.connect();
  }
}
