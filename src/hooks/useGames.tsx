import { RELAY_URL } from "../const";
import { arraySafeParse } from "../helpers/array";
import { parseGameEvent } from "../helpers/game-events";
import useRelaySub from "./useRelaySub";
import useSubEvents from "./useSubEvents";

export default function useGames(pubkey: string) {
  const sub = useRelaySub(RELAY_URL, "games", [
    { kinds: [2500], "#p": [pubkey] },
  ]);
  const events = useSubEvents(sub);

  return arraySafeParse(events, parseGameEvent);
}
