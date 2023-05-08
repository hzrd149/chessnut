import Chessground from "@react-chess/chessground";
import { useAuth } from "../../AuthProvider";
import {
  chessJsMovesToDests,
  ChessgroundConfig,
  shortColorToLong,
} from "../../helpers/chess";
import useSignal from "../../hooks/useSignal";
import ChessGame from "../../../common/classes/chess-game";

export type ChessboardProps = {
  game: ChessGame;
  onMove?: (move: string) => void;
};

export default function Chessboard({ game, onMove }: ChessboardProps) {
  const auth = useAuth();

  useSignal(game.onLoad);
  useSignal(game.onState);

  const isSpectator =
    auth.pubkey !== game.playerA && auth.pubkey !== game.playerB;

  const lastMove = game.getLastMove()?.split("-") as
    | ChessgroundConfig["lastMove"]
    | undefined;

  const config: ChessgroundConfig = {
    fen: game.chess.fen(),
    movable: {
      free: false,
      color: undefined,
    },
    viewOnly: isSpectator || game.isOver,
    lastMove,
    turnColor: game.chess.turn() === "w" ? "white" : "black",
    highlight: {
      lastMove: true,
      check: true,
    },
  };

  if (auth.pubkey && !isSpectator) {
    const myColor = game.getPlayerColor(auth.pubkey);
    config.orientation = shortColorToLong(myColor);

    const isMyTurn = game.chess.turn() === game.getPlayerColor(auth.pubkey);
    if (isMyTurn && config.movable) {
      config.movable.color = shortColorToLong(myColor);
      config.movable.showDests = true;
      config.movable.dests = chessJsMovesToDests(game.chess);

      config.events = {
        move: (from, to) => {
          if (onMove) onMove(from + "-" + to);
        },
      };
    }
  }

  return <Chessground config={config} contained />;
}
