import { RELAY_URL } from "../const";
import { arraySafeParse } from "../helpers/array";
import { parseGameEvent } from "../helpers/game-events";
import { useRelaySub } from "./useRelaySub";
import { useSubEvents } from "./useSubEvents";

export default function useGames(pubkey: string) {
  const sub = useRelaySub("games", RELAY_URL, [
    { kinds: [2500], limit: 10, "#p": [pubkey] },
  ]);
  const events = useSubEvents(sub);

  return arraySafeParse(events, parseGameEvent);
}
