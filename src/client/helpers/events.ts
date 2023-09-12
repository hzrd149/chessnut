import { EventTemplate } from "nostr-tools";
import { GameEventKinds, GameTypes } from "../../common/enum";
import { RELAY_URL } from "../const";
import dayjs from "dayjs";
import Game from "../../common/classes/game";
import { StateTypes } from "../../common/helpers/parse-event";
import { getDefaultState } from "../../common/helpers/create-game";

export function buildGameEvent(
  type: GameTypes,
  self: string,
  target: string,
  message: string,
  moderator: string,
) {
  const draft: EventTemplate = {
    kind: 2500 as number,
    content: message,
    tags: [
      ["type", type],
      ["p", self, RELAY_URL, "playerA"],
      ["p", target, RELAY_URL, "playerB"],
      ["p", moderator, RELAY_URL, "moderator"],
      ["state", getDefaultState(type)],
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

export function buildForfeitEvent(game: Game): EventTemplate {
  return {
    kind: GameEventKinds.State as number,
    created_at: dayjs().unix(),
    content: "",
    tags: [
      ["type", StateTypes.Forfeit],
      ["e", game.id, game.relay, "game"],
      ["p", game.moderator, game.relay, "moderator"],
      ["e", game.getHeadId(), game.relay, "previous"],
    ],
  };
}
