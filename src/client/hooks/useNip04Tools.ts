import { nip04 } from "nostr-tools";
import { useCallback } from "react";
import { useAuth } from "../AuthProvider";

export function useNip04Tools() {
  const auth = useAuth();

  const encrypt = useCallback(
    async (pubkey: string, text: string) => {
      if (auth.nip07 && window.nostr) {
        if (!window.nostr.nip04) throw new Error("encryption not supported");
        return window.nostr.nip04.encrypt(pubkey, text);
      }
      if (auth.secKey) {
        return nip04.encrypt(auth.secKey, pubkey, text);
      }
      throw new Error("No signing method");
    },
    [auth.nip07, auth.secKey]
  );
  const decrypt = useCallback(
    async (pubkey: string, encrypted: string) => {
      if (auth.nip07 && window.nostr) {
        if (!window.nostr.nip04) throw new Error("decryption not supported");
        return window.nostr.nip04.decrypt(pubkey, encrypted);
      }
      if (auth.secKey) {
        return nip04.decrypt(auth.secKey, pubkey, encrypted);
      }
      throw new Error("No signing method");
    },
    [auth.nip07, auth.secKey]
  );

  return { encrypt, decrypt };
}
