import { Event, EventTemplate, Sub } from "nostr-tools";
import Signal from "./signal.js";
import { GameEventKinds, GameTypes } from "../enum.js";
import {
  ParsedBet,
  ParsedFinish,
  ParsedState,
  parseBetEvent,
  parseFinishEvent,
  parseStateEvent,
} from "../helpers/parse-event.js";
import { getRelay } from "../services/relays.js";
import { ensureConnected } from "../helpers/relays.js";

export default class Game {
  id: string;
  type: GameTypes;
  relay: string;
  playerA: string;
  playerB: string;
  moderator: string;
  message: string;
  created: number;
  state: string;

  rootEvent: Event;
  finish?: ParsedFinish;
  states = new Map<string, ParsedState>();
  stateForwardRef = new Map<string, string[]>();
  bets = new Map<string, ParsedBet>();
  tail: string;

  loaded = false;

  sub?: Sub;

  onLoad = new Signal();
  onState = new Signal();
  onBet = new Signal();
  onFinish = new Signal();

  get isForfeit() {
    return !!this.getForfeit();
  }
  get isOver() {
    return this.isForfeit || !!this.finish || !!this.getWinner();
  }

  constructor(event: Event) {
    if ((event.kind as number) !== GameEventKinds.Game)
      throw new Error("event is not a game");

    this.playerA = event.pubkey;

    const playerB = event.tags.find(
      (t) => t[0] === "p" && t[3] === "playerB",
    )?.[1];
    if (!playerB) throw new Error("game missing playerB");
    this.playerB = playerB;

    const moderator = event.tags.find(
      (t) => t[0] === "p" && t[3] === "moderator",
    )?.[1];
    if (!moderator) throw new Error("game missing moderator");
    this.moderator = moderator;

    const state = event.tags.find((t) => t[0] === "state")?.[1];
    if (!state) throw new Error("event missing state");
    this.state = state;

    const relay = event.tags.find((t) => t[0] === "relay")?.[1];
    if (!relay) throw new Error("event missing relay");
    this.relay = relay;

    const type = event.tags.find((t) => t[0] === "type")?.[1];
    if (!type) throw new Error("event missing type");
    this.type = type as GameTypes;

    this.id = event.id;
    this.message = event.content;
    this.created = event.created_at;
    this.rootEvent = event;
    this.tail = event.id;
  }

  handleStateEvent(event: Event) {
    if (this.states.has(event.id)) return;

    try {
      const state = parseStateEvent(event);
      this.states.set(state.id, state);

      const refs = this.stateForwardRef.get(state.previous) ?? [];
      this.stateForwardRef.set(state.previous, refs.concat(state.id));
      this.onState.notify();
    } catch (e) {
      if (e instanceof Error)
        console.log("Failed to handle state", event.id, e.message);
    }
  }
  handleBetEvent(event: Event) {
    if (this.bets.has(event.id)) return;

    try {
      const bet = parseBetEvent(event);
      this.bets.set(bet.id, bet);
      this.onBet.notify();
    } catch (e) {
      if (e instanceof Error)
        console.log("Failed to handle bet event", event.id, e.message);
    }
  }
  handleFinishEvent(event: Event) {
    this.finish = parseFinishEvent(event);
    this.onFinish.notify();
  }

  walkState(fn: (state: ParsedState) => void) {
    let i = this.id;
    while (true) {
      const state = this.states.get(i);
      const refs = this.stateForwardRef.get(i);
      if (!refs || refs.length === 0) {
        if (state) fn(state);
        return;
      } else {
        if (refs.length > 1) throw new Error("Found branching state");
        if (state) fn(state);
        i = refs[0];
      }
    }
  }

  getHeadState() {
    let i = this.id;
    while (true) {
      const refs = this.stateForwardRef.get(i);
      if (!refs || refs.length === 0) {
        return this.states.get(i);
      } else {
        if (refs.length > 1) throw new Error("Found branching state");
        i = refs[0];
      }
    }
  }

  getLastMove() {
    let state = this.getHeadState();
    while (!!state) {
      if (state?.move) return state.move;
      if (state?.previous) {
        state = this.states.get(state.previous);
      } else return;
    }
  }
  getForfeit() {
    let state = this.getHeadState();
    while (!!state) {
      if (state?.type === "forfeit") return state;
      if (state?.previous) {
        state = this.states.get(state.previous);
      } else return;
    }
  }
  getWinner() {
    const forfeit = this.getForfeit();
    if (forfeit?.author === this.playerA) return this.playerB;
    if (forfeit?.author === this.playerB) return this.playerA;
  }
  isDraw() {
    return false;
  }
  isPlayer(player: string) {
    return player === this.playerA || player === this.playerB;
  }

  buildMoveEvent(move: string): EventTemplate {
    throw new Error("needs to be overridden");
  }

  getHeadId() {
    return this.getHeadState()?.id ?? this.id;
  }

  getPlayerBets() {
    const betsByPlayer: Record<string, number> = {};

    for (const [id, bet] of this.bets) {
      if (!bet.amount) continue;
      betsByPlayer[bet.player] = (betsByPlayer[bet.player] ?? 0) + bet.amount;
    }

    return betsByPlayer;
  }
  getTotalBets() {
    let total = 0;

    for (const [id, bet] of this.bets) {
      if (!bet.amount) continue;
      total += bet.amount;
    }

    return total;
  }

  async load() {
    const relay = getRelay(this.relay);
    await ensureConnected(relay);

    return new Promise<void>((res, rej) => {
      this.sub = relay.sub([
        {
          kinds: [
            GameEventKinds.State,
            GameEventKinds.Bet,
            GameEventKinds.Finish,
          ],
          "#e": [this.id],
        },
      ]);

      this.sub.on("event", (event) => {
        switch (event.kind as number) {
          case 2501:
            this.handleStateEvent(event);
            break;
          case 2502:
            this.handleBetEvent(event);
            break;
          case 2503:
            this.handleFinishEvent(event);
            break;
        }
      });
      this.sub.on("eose", () => {
        this.loaded = true;
        this.onLoad.notify();
        res();
      });
    });
  }

  unload() {
    if (this.sub) {
      this.sub.unsub();
      this.loaded = false;
      this.sub = undefined;
    }
  }
}
