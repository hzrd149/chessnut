import { Event, EventTemplate } from "nostr-tools";
import { RELAY_URL } from "../const";
import dayjs from "dayjs";
import { Chess, DEFAULT_POSITION } from "chess.js";
import Game from "../classes/game";

export type ParsedGame = {
  id: string;
  playerA: string;
  playerB: string;
  message: string;
  state: string;
  relay: string;
  created: number;
};
export function parseGameEvent(game: Event): ParsedGame {
  if ((game.kind as number) !== 2500) throw new Error("event is not a game");

  const playerB = game.tags.find(
    (t) => t[0] === "p" && t[3] === "playerB"
  )?.[1];
  if (!playerB) throw new Error("game missing playerB");

  const state = game.tags.find((t) => t[0] === "state")?.[1];
  if (!state) throw new Error("game missing state");

  const relay = game.tags.find((t) => t[0] === "relay")?.[1];
  if (!relay) throw new Error("game missing relay");

  return {
    id: game.id,
    playerA: game.pubkey,
    playerB,
    message: game.content,
    created: game.created_at,
    state,
    relay,
  };
}

export enum StateTypes {
  Move = "move",
}

export type ParsedState = {
  author: string;
  kind: number;
  state: string;
  type: StateTypes;
  move?: [string, string];
  event: Event;
};

export function parseStateEvent(state: Event): ParsedState {
  if ((state.kind as number) !== 2501)
    throw new Error("event is not a state event");

  const type = state.tags.find((t) => t[0] === "type")?.[1] as
    | StateTypes
    | undefined;
  if (!type) throw new Error("missing type");

  const stateStr = state.tags.find((t) => t[0] === "state")?.[1];
  if (!stateStr) throw new Error("missing state");

  const move = state.tags.find((t) => t[0] === "move");
  if (move && (!move[1] || !move[2])) throw new Error("malformed moved");

  return {
    author: state.pubkey,
    kind: state.kind as number,
    state: stateStr,
    type,
    move: move && [move[1], move[2]],
    event: state,
  };
}

export function buildDraftGameEvent(
  self: string,
  target: string,
  message: string,
  moderator: string
) {
  const draft: EventTemplate = {
    kind: 2500 as number,
    content: message,
    tags: [
      ["p", self, RELAY_URL, "playerA"],
      ["p", target, RELAY_URL, "playerB"],
      ["p", moderator, RELAY_URL, "moderator"],
      ["state", DEFAULT_POSITION],
      ["relay", RELAY_URL],
    ],
    created_at: dayjs().unix(),
  };

  return draft;
}

export function buildDraftMoveEvent(
  game: Game,
  source: string,
  target: string
) {
  const draft: EventTemplate = {
    kind: 2501 as number,
    content: "",
    created_at: dayjs().unix(),
    tags: [
      ["type", "move"],
      ["state", game.chess.fen()],
      ["move", source, target],
      ["e", game.id, game.relay, "game"],
      ["p", game.moderator, game.relay, "moderator"],
    ],
  };

  return draft;
}

if (import.meta.env.DEV) {
  //@ts-ignore
  window.Chess = Chess;
}
