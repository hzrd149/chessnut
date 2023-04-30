import Chessground from "@react-chess/chessground";
import { useAuth } from "../../AuthProvider";
import {
  chessJsMovesToDests,
  ChessgroundConfig,
  shortColorToLong,
} from "../../helpers/chess";
import useSignal from "../../hooks/useSignal";
import ChessGame from "../../../common/classes/chess-game";

type onMove = NonNullable<NonNullable<ChessgroundConfig["events"]>["move"]>;

export type ChessboardProps = {
  game: ChessGame;
  onMove?: onMove;
};

export default function Chessboard({ game, onMove }: ChessboardProps) {
  const auth = useAuth();

  useSignal(game.onLoad);
  useSignal(game.onState);

  const isSpectator =
    auth.pubkey !== game.playerA && auth.pubkey !== game.playerB;

  const lastMove = game.getHeadState()?.move?.split("-") as
    | ChessgroundConfig["lastMove"]
    | undefined;
  const config: ChessgroundConfig = {
    fen: game.getHeadState()?.state ?? game.state,
    movable: {
      free: false,
      color: undefined,
    },
    viewOnly: isSpectator,
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

      config.events = { move: onMove };
    }
  }

  return <Chessground config={config} contained />;
}
