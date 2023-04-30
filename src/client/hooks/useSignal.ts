import { useCallback, useEffect, useState } from "react";
import Signal from "../../common/classes/signal";

export default function useSignal(signal?: Signal) {
  const [v, setUpdate] = useState({});
  const update = useCallback(() => {
    setTimeout(() => {
      setUpdate({});
    }, 10);
  }, []);

  useEffect(() => {
    if (signal) {
      signal.on(update);
      return () => signal.off(update);
    }
  }, [signal, update]);
}
