import { Event, EventTemplate } from "nostr-tools";
import Game from "./game.js";
import { GameEventKinds, GameTypes } from "../enum.js";
import { StateTypes } from "../helpers/parse-event.js";
import dayjs from "dayjs";

const patterns = [
  // horizontal
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  //vertical
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  //other
  [0, 4, 8],
  [2, 4, 6],
];
type PlayerSymbol = "X" | "O";
export class TicTacToe {
  static DEFAULT_STATE = "HHHHHHHHHX";

  history: string[] = [];
  state = TicTacToe.DEFAULT_STATE;

  constructor(state?: string) {
    if (state) this.state = state;
  }

  turn(): PlayerSymbol {
    return this.state.endsWith("X") ? "X" : "O";
  }
  move(moveStr: string) {
    const x = parseInt(moveStr[0]);
    const y = parseInt(moveStr[1]);
    const symbol = moveStr[2] as PlayerSymbol;

    const index = y * 3 + x;
    if (Number.isFinite(index)) {
      const other: PlayerSymbol = symbol === "X" ? "O" : "X";

      this.history.push(this.state);

      const newState = this.state.split("");
      newState[index] = symbol;
      newState[newState.length - 1] = other;
      this.state = newState.join("");
    }
  }
  moves() {
    const turn = this.turn();
    const moves: string[] = [];

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (this.state[y * 3 + x] === "H") {
          moves.push("" + x + y + turn);
        }
      }
    }

    return moves;
  }
  undo() {
    if (this.history.length > 0) {
      this.state = this.history.pop() as string;
    }
  }
  reset() {
    this.history = [];
    this.state = TicTacToe.DEFAULT_STATE;
  }
  getWinner() {
    for (const pattern of patterns) {
      const [a, b, c] = pattern.map((i) => this.state[i]);
      if (a === b && b === c && a !== "H") {
        return a as PlayerSymbol;
      }
    }
  }
  isDraw() {
    return this.getWinner() === undefined ? !this.state.includes("H") : false;
  }
}

export default class TicTacToeGame extends Game {
  tictactoe: TicTacToe;

  constructor(event: Event) {
    super(event);
    if (this.type !== GameTypes.TicTacToe)
      throw new Error("game not TicTacToe");

    this.tictactoe = new TicTacToe(this.state);

    this.onState.on(() => {
      this.tictactoe.reset();
      this.walkState((state) => {
        if (state.move) {
          this.tictactoe.move(state.move);
        }
      });
    });
  }

  getPlayerSymbol(pubkey: string): PlayerSymbol {
    if (pubkey === this.playerA) return "O";
    if (pubkey === this.playerB) return "X";
    throw new Error("unrecognized pubkey");
  }

  move(move: string) {
    this.tictactoe.move(move);
  }

  buildMoveEvent(move: string) {
    this.tictactoe.move(move);

    const draft: EventTemplate = {
      kind: GameEventKinds.State as number,
      content: "",
      created_at: dayjs().unix(),
      tags: [
        ["type", StateTypes.Move],
        ["move", move],
        ["state", this.tictactoe.state],
        ["e", this.id, this.relay, "game"],
        ["e", this.getHeadId(), this.relay, "previous"],
        ["p", this.moderator, this.relay, "moderator"],
      ],
    };

    this.tictactoe.undo();

    return draft;
  }

  getWinner() {
    const winner = super.getWinner();

    if (winner) return winner;

    const winningSymbol = this.tictactoe.getWinner();
    if (winningSymbol) {
      if (winningSymbol === this.getPlayerSymbol(this.playerA))
        return this.playerA;
      if (winningSymbol === this.getPlayerSymbol(this.playerB))
        return this.playerB;
    }
  }
  isDraw(): boolean {
    return this.tictactoe.isDraw();
  }
}
