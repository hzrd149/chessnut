import { nip19 } from "nostr-tools";

export function normalizeToHex(pubkey: string) {
  return pubkey.startsWith("npub")
    ? (nip19.decode(pubkey).data as string)
    : pubkey;
}
