import { EventTemplate, finishEvent } from "nostr-tools";
import { useCallback } from "react";
import { useAuth } from "../AuthProvider";

export function useSigner() {
  const auth = useAuth();

  const signer = useCallback(
    async (event: EventTemplate) => {
      if (auth.nip07 && window.nostr) {
        return window.nostr.signEvent(event);
      }
      if (auth.secKey) {
        return finishEvent(event, auth.secKey);
      }
      throw new Error("No signing method");
    },
    [auth],
  );

  return signer;
}
