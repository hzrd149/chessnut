import { useEffect } from "react";
import Game from "../classes/game";
import { useForceUpdate } from "@chakra-ui/react";

export default function useGameListener(game?: Game) {
  const update = useForceUpdate();
  useEffect(() => {
    if (game) {
      game.on(update);
      return () => game.off(update);
    }
  }, [game]);
}
