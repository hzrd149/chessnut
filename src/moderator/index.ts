import "dotenv/config.js";
import { getRelay } from "./relays.js";
import { getPubkey } from "./keys.js";
import { GameEventKinds } from "../common/const.js";
import { handleGameEvent, unloadAllGames } from "./games.js";
import { handlePlaceBetEvent } from "./bets.js";
import { ensureConnected } from "../common/helpers/relays.js";

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
  switch (event.kind as number) {
    case GameEventKinds.PlaceBet:
      try {
        console.log(`Received place bet from ${event.pubkey}`);

        await handlePlaceBetEvent(event);
      } catch (e) {
        console.log(`Failed to handle place bet event ${event.id}`);
        console.log(e);
      }
      break;
    case GameEventKinds.Game:
      // start watching the game
      const game = handleGameEvent(event);
      await game.load();
      break;
  }
});

function shutdown() {
  console.log("\n");
  console.log("Shutting down");
  unloadAllGames();

  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
