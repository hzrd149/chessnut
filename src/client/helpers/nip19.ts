import { nip19 } from "nostr-tools";

export function normalizeToHex(pubkey: string) {
  const clean = pubkey.replace("nostr:", "");
  if (clean.length === 64) {
    return clean;
  } else {
    const parsed = nip19.decode(clean);
    if (parsed.type === "npub") {
      return parsed.data;
    } else if (parsed.type === "nprofile") {
      return parsed.data.pubkey;
    }
  }
  return pubkey;
}
