import { Event } from "nostr-tools";
import { GameTypes } from "../const.js";
import ChessGame from "../classes/chess-game.js";
import TicTacToeGame, { TicTacToe } from "../classes/tic-tac-toe-game.js";
import { DEFAULT_POSITION } from "chess.js";

export default function createGameClass(event: Event) {
  const type = event.tags.find((t) => t[0] === "type")?.[1];
  if (!type) throw new Error("missing type");

  switch (type) {
    case GameTypes.Chess:
      return new ChessGame(event);
    case GameTypes.TicTacToe:
      return new TicTacToeGame(event);
    default:
      throw new Error("unrecognized game type");
  }
}

export function getDefaultState(type: GameTypes) {
  switch (type) {
    case GameTypes.Chess:
      return DEFAULT_POSITION;
    case GameTypes.TicTacToe:
      return TicTacToe.DEFAULT_STATE;
  }
}
