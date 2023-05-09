import { getPublicKey as nostrGetPubKey, nip19 } from "nostr-tools";
import { MOD_NSEC } from "./const.js";

export function getSecKey() {
  const nsec = MOD_NSEC;
  if (nsec.startsWith("nsec")) {
    return nip19.decode(nsec).data as string;
  } else return nsec;
}
export function getPubkey() {
  return nostrGetPubKey(getSecKey());
}
