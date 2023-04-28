import { useMemo } from "react";
import Chessground from "@react-chess/chessground";
import { useAuth } from "../../AuthProvider";
import Game from "../../classes/game";
import {
  chessJsMovesToDests,
  ChessgroundConfig,
  shortColorToLong,
} from "../../helpers/chess";
import useGameListener from "../../hooks/useGameListener";

type onMove = NonNullable<NonNullable<ChessgroundConfig["events"]>["move"]>;

export type ChessboardProps = {
  game: Game;
  onMove?: onMove;
};

export default function Chessboard({ game, onMove }: ChessboardProps) {
  const auth = useAuth();

  useGameListener(game);
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

        config.events = { move: onMove };
      }
    }

    return config;
  }, [game]);

  return <Chessground config={config} contained />;
}
