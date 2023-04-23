import { useForceUpdate } from "@chakra-ui/react";
import { Relay } from "nostr-tools";
import { useEffect } from "react";

export default function useRelayStatus(relay: Relay) {
  const update = useForceUpdate();

  useEffect(() => {
    relay.on("connect", update);
    relay.on("disconnect", update);

    return () => {
      relay.off("connect", update);
      relay.off("disconnect", update);
    };
  }, [relay]);

  return relay.status;
}
