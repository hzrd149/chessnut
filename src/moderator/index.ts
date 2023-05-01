import "dotenv/config.js";
import { ensureConnected, getRelay } from "./relays.js";
import { getPubkey } from "./keys.js";
import { GameEventKinds } from "../common/const.js";
import { getGameFromId, handleGameEvent, unloadAllGames } from "./games.js";
import { handlePlaceBetEvent } from "./bets.js";

import crypto from "node:crypto";
// @ts-ignore
globalThis.crypto = crypto;

const RELAY_URL = "wss://nostrue.com";

const relay = getRelay(RELAY_URL);
await ensureConnected(relay);
console.log(`Connected to relay: ${RELAY_URL}`);
console.log(`Pubkey: ${getPubkey()}`);

const sub = relay.sub([{ "#p": [getPubkey()] }]);

sub.on("event", async (event) => {
  const gameId = event.tags.find((t) => t[0] === "e" && t[1])?.[1];
  if (!gameId) return;

  switch (event.kind as number) {
    case GameEventKinds.PlaceBet:
      try {
        await handlePlaceBetEvent(event);
      } catch (e) {
        console.log(`Failed to handle place bet event ${event.id}`);
        console.log(e);
      }
      break;
    case GameEventKinds.Game:
      // start watching the game
      const game = handleGameEvent(event);
      game.load();
      break;
  }
  if ((event.kind as number) === GameEventKinds.PlaceBet) {
    const game = await getGameFromId(gameId);
    await game.load();
  } else {
    // load the game
    getGameFromId(gameId);
  }
});

function shutdown() {
  console.log("\n");
  console.log("Shutting down");
  unloadAllGames();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
