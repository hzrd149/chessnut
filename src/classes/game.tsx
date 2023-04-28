import { Event, Sub } from "nostr-tools";
import { ensureConnected, getRelay } from "../services/relays";
import { Chess, Color } from "chess.js";
import { ParsedState } from "../helpers/game-events";

export default class Game {
  id: string;
  relay: string;
  playerA: string;
  playerB: string;
  moderator: string;
  message: string;
  created: number;
  state: string;

  private rootEvent: Event;
  private finish?: Event;
  private states = new Map<string, ParsedState>();
  private stateForwardRef = new Map<string, string[]>();
  private rewards: Event[] = [];

  loaded = false;

  sub?: Sub;
  chess: Chess;

  private listeners = new Set<Function>();
  on(fn: Function) {
    this.listeners.add(fn);
  }
  off(fn: Function) {
    this.listeners.delete(fn);
  }
  notify() {
    for (const fn of this.listeners) fn();
  }

  constructor(event: Event) {
    if ((event.kind as number) !== 2500) throw new Error("event is not a game");

    this.playerA = event.pubkey;

    const playerB = event.tags.find(
      (t) => t[0] === "p" && t[3] === "playerB"
    )?.[1];
    if (!playerB) throw new Error("game missing playerB");
    this.playerB = playerB;

    const moderator = event.tags.find(
      (t) => t[0] === "p" && t[3] === "moderator"
    )?.[1];
    if (!moderator) throw new Error("game missing moderator");
    this.moderator = moderator;

    const state = event.tags.find((t) => t[0] === "state")?.[1];
    if (!state) throw new Error("event missing state");
    this.state = state;

    const relay = event.tags.find((t) => t[0] === "relay")?.[1];
    if (!relay) throw new Error("event missing relay");
    this.relay = relay;

    this.id = event.id;
    this.message = event.content;
    this.created = event.created_at;
    this.rootEvent = event;

    this.chess = new Chess(this.state);
  }

  getPlayerColor(pubkey: string): Color {
    if (pubkey === this.playerA) return "b";
    if (pubkey === this.playerB) return "w";
    throw new Error("unrecognized pubkey");
  }

  move(from: string, to: string) {
    this.chess.move({ from, to, promotion: "q" });
    this.notify();
  }

  private handleStateEvent(state: Event) {
    // const prev;
  }

  async load() {
    const relay = getRelay(this.relay);
    await ensureConnected(relay);

    this.sub = relay.sub([{ kinds: [2501, 2502, 2503], "#e": [this.id] }]);

    this.sub.on("event", (event) => {
      switch (event.kind as number) {
        case 2501:
          this.states.set(event.id, event);
          break;
        case 2502:
          this.rewards.push(event);
          break;
        case 2503:
          this.finish = event;
          break;
      }
    });
    this.sub.on("eose", () => {
      this.loaded = true;
      this.notify();
    });
  }

  get lastState() {}

  unload() {
    if (this.sub) {
      this.sub.unsub();
      this.loaded = false;
      this.sub = undefined;
    }
  }
}
