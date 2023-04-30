import { Event, EventTemplate, Sub, nip04 } from "nostr-tools";
import Signal from "./signal";
import dayjs from "dayjs";
import { GameEventKinds, GameTypes } from "../const";
import { ParsedState, parseStateEvent } from "../event-helpers";
import { ensureConnected, getRelay } from "../services/relays";

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
  finish?: Event;
  states = new Map<string, ParsedState>();
  stateForwardRef = new Map<string, string[]>();
  rewards: Event[] = [];
  tail: string;

  loaded = false;

  sub?: Sub;

  onLoad = new Signal();
  onState = new Signal();

  constructor(event: Event) {
    if ((event.kind as number) !== GameEventKinds.Game)
      throw new Error("event is not a game");

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
      console.log("failed to handle state", event);
      console.log(e);
    }
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

  async load() {
    const relay = getRelay(this.relay);
    await ensureConnected(relay);

    return new Promise<void>((res, rej) => {
      this.sub = relay.sub([
        {
          kinds: [
            GameEventKinds.State,
            GameEventKinds.PostBet,
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
            this.rewards.push(event);
            break;
          case 2503:
            this.finish = event;
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

  createPlaceBetEvent(token: string) {
    const draft: EventTemplate = {
      kind: GameEventKinds.PlaceBet as number,
      created_at: dayjs().unix(),
      content: "",
      tags: [
        ["e", this.id, this.relay, "game"],
        ["p", this.moderator, this.relay, "moderator"],
        ["cashu", token],
      ],
    };

    return draft;
  }
}
