import { ensureConnected, getRelay } from "../../common/services/relays";
import { Sub } from "nostr-tools";
import { RELAY_URL } from "../const";
import Signal from "../../common/classes/signal";
import { GameEventKinds } from "../../common/const";
import ChessGame from "../../common/classes/chess-game";
import createGameClass from "../../common/helpers/create-game";

const games = new Map<string, ChessGame>();
const subs = new Map<string, Sub>();

export const onGamesChange = new Signal();

export async function loadGames(pubkey: string) {
  if (subs.has(pubkey)) return;
  const relay = getRelay(RELAY_URL);
  await ensureConnected(relay);

  const sub = relay.sub([
    { kinds: [GameEventKinds.Game], "#p": [pubkey] },
    { kinds: [GameEventKinds.Game], authors: [pubkey] },
  ]);

  sub.on("event", (event) => {
    try {
      const game = createGameClass(event);
      games.set(game.id, game);
      // pre-load the game (get bets and finish state)
      game.load().then(() => onGamesChange.notify());
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
  return Array.from(games).map(([id, event]) => event);
}
export function clearGames() {
  games.clear();
}
export function clearSubs() {
  for (const [pubkey, sub] of subs) {
    sub.unsub();
  }
  subs.clear();
}

export async function loadGameById(gameId: string, relayUrl?: string) {
  const cache = games.get(gameId);
  if (cache) return cache;

  const relay = getRelay(relayUrl ?? RELAY_URL);
  await ensureConnected(relay);

  const event = await relay.get({ ids: [gameId] });
  if (!event) throw new Error("Failed to find game event");

  const game = createGameClass(event);
  games.set(game.id, game);
  onGamesChange.notify();

  return game;
}

if (import.meta.env.DEV) {
  // @ts-ignore
  window.gamesService = {
    loadGames,
    listGames,
  };
}
