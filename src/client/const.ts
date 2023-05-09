import { nip19 } from "nostr-tools";

const VITE_RELAY_URL = import.meta.env.VITE_RELAY_URL;
if (!VITE_RELAY_URL) throw new Error("Missing VITE_RELAY_URL");

const VITE_MOD_NPUB = import.meta.env.VITE_MOD_NPUB;
if (!VITE_MOD_NPUB) throw new Error("Missing VITE_MOD_NPUB");

const MODERATOR_PUBKEY = nip19.decode(VITE_MOD_NPUB).data as string;

export { VITE_RELAY_URL as RELAY_URL, MODERATOR_PUBKEY };
