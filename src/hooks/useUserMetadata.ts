import { useMemo } from "react";
import { RELAY_URL } from "../const";
import useSingleEvent from "./useSingleEvent";

export default function useUserMetadata(pubkey: string) {
  const metadata = useSingleEvent(RELAY_URL, { authors: [pubkey], kinds: [0] });

  const parsed = useMemo(() => {
    return (
      metadata &&
      (JSON.parse(metadata.content) as {
        name?: string;
        display_name?: string;
        picture?: string;
        nip05?: string;
      })
    );
  }, [metadata]);

  return parsed;
}
