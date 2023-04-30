import { EventTemplate } from "nostr-tools";
import { GameTypes } from "../../common/const";
import { RELAY_URL } from "../const";
import { DEFAULT_POSITION } from "chess.js";
import dayjs from "dayjs";

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
