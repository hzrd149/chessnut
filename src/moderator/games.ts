import { Event, EventTemplate, finishEvent, nip04 } from "nostr-tools";
import ChessGame from "../common/classes/chess-game.js";
import { RELAY_URL } from "./const.js";
import { getRelay } from "./relays.js";
import createGameClass from "../common/helpers/create-game.js";
import dayjs from "dayjs";
import { GameEventKinds, GameFinishReasons } from "../common/enum.js";
import { getFullTokenForBet } from "./db.js";
import { getSecKey } from "./keys.js";
import { waitForPub, ensureConnected } from "../common/helpers/relays.js";
import TicTacToeGame from "../common/classes/tic-tac-toe-game.js";
import Game from "../common/classes/game.js";

const games = new Map<string, ChessGame | TicTacToeGame>();

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

async function checkGameState(game: Game) {
  if (!game.loaded) return;
  if (game.finish) return;

  const winner = game.getWinner();
  if (winner) {
    try {
      const tokens: string[] = [];
      for (const [id, bet] of game.bets) {
        const token = await getFullTokenForBet(id);
        if (token) tokens.push(token);
      }

      var draft: EventTemplate = {
        kind: GameEventKinds.Finish as number,
        created_at: dayjs().unix(),
        content: "",
        tags: [
          ["e", game.id, game.relay, "game"],
          ["e", game.getHeadId(), "previous"],
          ["reason", GameFinishReasons.Win],
          ["p", game.playerA, game.relay, "player"],
          ["p", game.playerB, game.relay, "player"],
          ["winner", winner],
        ],
      };

      if (tokens.length > 0) {
        let encryptedTokens = await nip04.encrypt(
          getSecKey(),
          winner,
          JSON.stringify(tokens)
        );
        draft.tags.push(["cashu", encryptedTokens, winner]);
      }

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
  } else if (game.isDraw()) {
    try {
      const tokens: Record<string, string[]> = {};
      for (const [id, bet] of game.bets) {
        const token = await getFullTokenForBet(id);
        if (!token) continue;
        tokens[bet.player] = tokens[bet.player] || [];
        tokens[bet.player].push(token);
      }

      var draft: EventTemplate = {
        kind: GameEventKinds.Finish as number,
        created_at: dayjs().unix(),
        content: "",
        tags: [
          ["e", game.id, game.relay, "game"],
          ["e", game.getHeadId(), "previous"],
          ["reason", GameFinishReasons.Draw],
          ["p", game.playerA, game.relay, "player"],
          ["p", game.playerB, game.relay, "player"],
        ],
      };

      if (tokens[game.playerA] && tokens[game.playerA].length > 0) {
        let encryptedTokens = await nip04.encrypt(
          getSecKey(),
          game.playerA,
          JSON.stringify(tokens[game.playerA])
        );
        draft.tags.push(["cashu", encryptedTokens, game.playerA]);
      }
      if (tokens[game.playerB] && tokens[game.playerB].length > 0) {
        let encryptedTokens = await nip04.encrypt(
          getSecKey(),
          game.playerB,
          JSON.stringify(tokens[game.playerB])
        );
        draft.tags.push(["cashu", encryptedTokens, game.playerB]);
      }

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
