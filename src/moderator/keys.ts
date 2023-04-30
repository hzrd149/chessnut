import { getPublicKey as nostrGetPubKey, nip19 } from "nostr-tools";
import { NOSTR_NSEC } from "./const";

export function getSecKey() {
  const nsec = NOSTR_NSEC;
  if (nsec.startsWith("nsec")) {
    return nip19.decode(nsec).data as string;
  } else return nsec;
}
export function getPubkey() {
  return nostrGetPubKey(getSecKey());
}
