import { useEffect } from "react";
import { ensureConnected, getRelay } from "../services/relays";
import { useForceUpdate } from "@chakra-ui/react";

export default function useConnectedRelay(url: string) {
  const relay = getRelay(url);

  const update = useForceUpdate();
  useEffect(() => {
    relay.on("connect", update);
    relay.on("disconnect", update);

    return () => {
      relay.off("connect", update);
      relay.off("disconnect", update);
    };
  }, [url]);

  useEffect(() => {
    if (relay.status === WebSocket.CLOSED) {
      ensureConnected(relay);
    }
  }, [relay.status]);

  return relay.status === WebSocket.OPEN ? relay : null;
}
