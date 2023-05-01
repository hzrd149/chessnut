import { Event, EventTemplate } from "nostr-tools";
import Game from "./game.js";
import { Chess, Color } from "chess.js";
import { GameEventKinds, GameTypes } from "../const.js";
import dayjs from "dayjs";
import { StateTypes } from "../event-helpers.js";

export default class ChessGame extends Game {
  chess: Chess;

  constructor(event: Event) {
    super(event);
    if (this.type !== GameTypes.Chess) throw new Error("game not chess");

    this.chess = new Chess(this.state);

    this.onState.on(() => {
      this.chess.reset();
      this.walkState((state) => {
        if (state.move) {
          this.chess.move(state.move);
        }
      });
    });
  }

  getPlayerColor(pubkey: string): Color {
    if (pubkey === this.playerA) return "b";
    if (pubkey === this.playerB) return "w";
    throw new Error("unrecognized pubkey");
  }

  move(from: string, to: string) {
    this.chess.move({ from, to, promotion: "q" });
    this.onLoad.notify();
  }

  makeMove(from: string, to: string) {
    this.chess.move({ from, to, promotion: "q" });

    const draft: EventTemplate = {
      kind: GameEventKinds.State as number,
      content: "",
      created_at: dayjs().unix(),
      tags: [
        ["type", StateTypes.Move],
        ["move", [from, to].join("-")],
        ["state", this.chess.fen()],
        ["e", this.id, this.relay, "game"],
        ["e", this.getHeadState()?.id ?? this.id, this.relay, "previous"],
        ["p", this.moderator, this.relay, "moderator"],
      ],
    };

    this.chess.undo();

    return draft;
  }
}
