import { Event } from "nostr-tools";
import Game from "../common/classes/game.js";
import { RELAY_URL } from "./const.js";
import { ensureConnected, getRelay } from "./relays.js";

const games = new Map<string, Game>();

export function handleGameEvent(event: Event) {
  const game = new Game(event);
  games.set(event.id, game);
  return game;
}

export async function getGameFromId(gameId: string) {
  const relay = getRelay(RELAY_URL);
  await ensureConnected(relay);
  const event = await relay.get({ ids: [gameId] });

  if (!event) throw new Error(`Failed to find game ${gameId}`);
  const game = new Game(event);

  games.set(gameId, game);
  return game;
}

export function unloadAllGames() {
  for (const [id, game] of games) {
    game.unload();
  }
}
