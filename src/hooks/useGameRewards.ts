import { ParsedGame } from "../helpers/game-events";
import useRelaySub from "./useRelaySub";
import useSubEvents from "./useSubEvents";

export default function useGameRewards(game: ParsedGame) {
  const sub = useRelaySub(game.relay, `${game.id}-rewards`, [
    { kinds: [2502] },
  ]);
  const rewards = useSubEvents(sub);

  return rewards;
}
