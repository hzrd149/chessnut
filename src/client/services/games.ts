import { getRelay } from "../../common/services/relays";
import { Sub } from "nostr-tools";
import { RELAY_URL } from "../const";
import Signal from "../../common/classes/signal";
import Game from "../../common/classes/game";

const gameEvents = new Map<string, Game>();
const subs = new Map<string, Sub>();

export const onGamesChange = new Signal();

export function loadGames(pubkey: string) {
  if (subs.has(pubkey)) return;
  const relay = getRelay(RELAY_URL);
  const sub = relay.sub([
    { kinds: [2500], "#p": [pubkey] },
    { kinds: [2500], authors: [pubkey] },
  ]);

  sub.on("event", (event) => {
    try {
      gameEvents.set(event.id, new Game(event));
      onGamesChange.notify();
    } catch (e) {
      console.log(`Failed to parse game ${event.id}`);
      console.log(e);
      console.log(event);
    }
  });

  subs.set(pubkey, sub);
}
export function listGames() {
  return Array.from(gameEvents).map(([id, event]) => event);
}
export function clearGames() {
  gameEvents.clear();
}
export function clearSubs() {
  for (const [pubkey, sub] of subs) {
    sub.unsub();
  }
  subs.clear();
}

if (import.meta.env.DEV) {
  // @ts-ignore
  window.gamesService = {
    loadGames,
    listGames,
  };
}
