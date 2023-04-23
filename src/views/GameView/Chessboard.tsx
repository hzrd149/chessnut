import { useMemo } from "react";
import Chessground from "@react-chess/chessground";
import { useAuth } from "../../AuthProvider";
import Game from "../../classes/game";
import {
  chessJsMovesToDests,
  ChessgroundConfig,
  shortColorToLong,
} from "../../helpers/chess";

export default function Chessboard({ game }: { game: Game }) {
  const auth = useAuth();
  const config = useMemo(() => {
    const isSpectator =
      auth.pubkey !== game.playerA && auth.pubkey !== game.playerB;

    const config: ChessgroundConfig = {
      fen: game.state,
      movable: {
        free: false,
        color: undefined,
      },
      viewOnly: isSpectator,
      turnColor: game.chess.turn() === "w" ? "white" : "black",
    };

    if (auth.pubkey && !isSpectator) {
      const myColor = game.getPlayerColor(auth.pubkey);
      config.orientation = shortColorToLong(myColor);

      const isMyTurn = game.chess.turn() === game.getPlayerColor(auth.pubkey);
      if (isMyTurn && config.movable) {
        config.movable.color = shortColorToLong(myColor);
        config.movable.showDests = true;
        config.movable.dests = chessJsMovesToDests(game.chess);
      }
    }

    return config;
  }, [game]);

  return <Chessground config={config} contained />;
}
