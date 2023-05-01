import { EventTemplate } from "nostr-tools";
import { GameEventKinds, GameTypes } from "../../common/const";
import { RELAY_URL } from "../const";
import { DEFAULT_POSITION } from "chess.js";
import dayjs from "dayjs";
import Game from "../../common/classes/game";

export function buildDraftGameEvent(
  type: GameTypes,
  self: string,
  target: string,
  message: string,
  moderator: string
) {
  const draft: EventTemplate = {
    kind: 2500 as number,
    content: message,
    tags: [
      ["type", type],
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

export function buildPlaceBetEvent(game: Game, token: string) {
  const draft: EventTemplate = {
    kind: GameEventKinds.PlaceBet as number,
    created_at: dayjs().unix(),
    content: "",
    tags: [
      ["e", game.id, game.relay, "game"],
      ["p", game.moderator, game.relay, "moderator"],
      ["cashu", token],
    ],
  };

  return draft;
}
