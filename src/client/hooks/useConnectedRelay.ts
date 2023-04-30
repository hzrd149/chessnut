import { useEffect } from "react";
import { ensureConnected, getRelay } from "../../common/services/relays";
import useRelayStatus from "./useRelayStatus";

export default function useConnectedRelay(url: string) {
  const relay = getRelay(url);
  const status = useRelayStatus(relay);

  useEffect(() => {
    if (status === WebSocket.CLOSED) {
      ensureConnected(relay);
    }
  }, [status]);

  return relay.status === WebSocket.OPEN ? relay : null;
}
