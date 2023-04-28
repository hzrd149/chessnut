import { useEffect } from "react";
import { useForceUpdate } from "@chakra-ui/react";
import Signal from "../classes/signal";

export default function useSignal(signal?: Signal) {
  const update = useForceUpdate();
  useEffect(() => {
    if (signal) {
      signal.on(update);
      return () => signal.off(update);
    }
  }, [signal]);
}
