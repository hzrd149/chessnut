import { Event } from "nostr-tools";
import { GameTypes } from "../const.js";
import ChessGame from "../classes/chess-game.js";

export default function createGameClass(event: Event) {
  const type = event.tags.find((t) => t[0] === "type")?.[1];
  if (!type) throw new Error("missing type");

  switch (type) {
    case GameTypes.Chess:
      return new ChessGame(event);
    default:
      throw new Error("unrecognized game type");
  }
}
