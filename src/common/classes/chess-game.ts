import { Event, EventTemplate } from "nostr-tools";
import Game from "./game.js";
import { Chess, Color } from "chess.js";
import { GameEventKinds, GameTypes } from "../enum.js";
import dayjs from "dayjs";
import { StateTypes } from "../helpers/parse-event.js";

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
          const [from, to] = state.move.split("-");
          this.chess.move({ from, to, promotion: "q" });
        }
      });
    });
  }

  getPlayerColor(pubkey: string): Color {
    if (pubkey === this.playerA) return "b";
    if (pubkey === this.playerB) return "w";
    throw new Error("unrecognized pubkey");
  }

  move(moveStr: string) {
    const [from, to] = moveStr.split("-");
    this.chess.move({ from, to, promotion: "q" });
  }

  buildMoveEvent(moveStr: string) {
    const [from, to] = moveStr.split("-");
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
        ["e", this.getHeadId(), this.relay, "previous"],
        ["p", this.moderator, this.relay, "moderator"],
      ],
    };

    this.chess.undo();

    return draft;
  }

  getWinner() {
    const winner = super.getWinner();

    if (winner) return winner;

    if (this.chess.isCheckmate()) {
      const turn = this.chess.turn();
      if (turn === this.getPlayerColor(this.playerA)) return this.playerB;
      if (turn === this.getPlayerColor(this.playerB)) return this.playerA;
    }
  }
  isDraw(): boolean {
    return this.chess.isDraw();
  }
}
