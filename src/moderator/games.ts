import { Event, EventTemplate, finishEvent, nip04 } from "nostr-tools";
import ChessGame from "../common/classes/chess-game.js";
import { RELAY_URL } from "./const.js";
import { getRelay } from "./relays.js";
import createGameClass from "../common/helpers/create-game.js";
import dayjs from "dayjs";
import { GameEventKinds } from "../common/const.js";
import { getFullTokenForBet } from "./db.js";
import { getSecKey } from "./keys.js";
import { waitForPub, ensureConnected } from "../common/helpers/relays.js";

const games = new Map<string, ChessGame>();

export function handleGameEvent(event: Event) {
  const game = createGameClass(event);

  const listener = () => checkGameState(game);
  game.onLoad.on(listener);
  game.onState.on(listener);

  games.set(event.id, game);
  return game;
}

export async function loadGame(gameId: string) {
  const relay = getRelay(RELAY_URL);
  await ensureConnected(relay);
  const event = await relay.get({ ids: [gameId] });

  if (!event) throw new Error(`Failed to find game ${gameId}`);
  return handleGameEvent(event);
}

async function checkGameState(game: ChessGame) {
  if (!game.loaded) return;
  if (game.finish) return;

  const winner = game.getWinner();
  if (winner) {
    const looser = winner === game.playerA ? game.playerB : game.playerA;

    try {
      const tokens: string[] = [];
      for (const [id, bet] of game.bets) {
        const token = await getFullTokenForBet(id);
        if (token) tokens.push(token);
      }

      const encryptedTokens = await nip04.encrypt(
        getSecKey(),
        winner,
        JSON.stringify(tokens)
      );

      const draft: EventTemplate = {
        kind: GameEventKinds.Finish as number,
        created_at: dayjs().unix(),
        content: "",
        tags: [
          ["e", game.id, game.relay, "game"],
          ["p", winner, game.relay, "winner"],
          ["p", looser, game.relay, "looser"],
          ["e", game.getHeadId(), "previous"],
          ["cashu", encryptedTokens, winner],
        ],
      };

      const event = await finishEvent(draft, getSecKey());
      const relay = getRelay(game.relay);
      await ensureConnected(relay);
      const pub = relay.publish(event);
      await waitForPub(pub);

      console.log(`Published finish event for ${game.id}`);
    } catch (e) {
      console.log("Failed to publish finish event for game", game.id);
      console.log(e);
    }
  }
}

export function unloadAllGames() {
  for (const [id, game] of games) {
    game.unload();
  }
}
