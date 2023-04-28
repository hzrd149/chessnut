import { Event } from "nostr-tools";
import Game from "./game";
import { Chess, Color } from "chess.js";
import { GameTypes } from "../const";

export default class ChessGame extends Game {
  chess: Chess;

  constructor(event: Event) {
    super(event);
    if (this.type !== GameTypes.Chess) throw new Error("game not chess");

    this.chess = new Chess(this.state);
  }

  getPlayerColor(pubkey: string): Color {
    if (pubkey === this.playerA) return "b";
    if (pubkey === this.playerB) return "w";
    throw new Error("unrecognized pubkey");
  }

  move(from: string, to: string) {
    this.chess.move({ from, to, promotion: "q" });
    this.onChange.notify();
  }
}
