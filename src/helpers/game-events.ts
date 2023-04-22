import { Event, EventTemplate } from "nostr-tools";
import { RELAY_URL } from "../const";
import dayjs from "dayjs";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

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
      ["state", START_FEN],
      ["relay", RELAY_URL],
    ],
    created_at: dayjs().unix(),
  };

  return draft;
}
