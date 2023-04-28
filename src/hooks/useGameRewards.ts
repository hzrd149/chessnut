import Game from "../classes/game";
import useRelaySub from "./useRelaySub";
import useSubEvents from "./useSubEvents";

export default function useGameRewards(game: Game) {
  const sub = useRelaySub(game.relay, `${game.id}-rewards`, [
    { kinds: [2502] },
  ]);
  const rewards = useSubEvents(sub);

  return rewards;
}
