import { RELAY_URL } from "../const";
import { ensureConnected, getRelay } from "./relays";

export type Metadata = {
  name?: string;
  display_name?: string;
  picture?: string;
  nip05?: string;
};

const userMetadata = new Map<string, Metadata>();

export async function getUserMetadata(pubkey: string) {
  const cached = userMetadata.get(pubkey);
  if (cached) return cached;

  const relay = getRelay(RELAY_URL);
  await ensureConnected(relay);
  const event = await relay.get({ authors: [pubkey], kinds: [0] });

  if (event) {
    const metadata = JSON.parse(event.content) as Metadata;
    userMetadata.set(pubkey, metadata);
    return metadata;
  }
}
