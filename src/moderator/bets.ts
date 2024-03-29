import dayjs from "dayjs";
import { getDecodedToken, getEncodedToken } from "@cashu/cashu-ts";
import { Event, EventTemplate, finishEvent, nip04 } from "nostr-tools";
import type { Token } from "@cashu/cashu-ts/dist/lib/es5/model/types";

import { getWallet } from "./cashu.js";
import { getSecKey } from "./keys.js";
import { loadGame } from "./games.js";
import { saveFullTokenForBet } from "./db.js";
import { GameEventKinds } from "../common/enum.js";
import { getRelay } from "../common/services/relays.js";
import { ensureConnected } from "../common/helpers/relays.js";

const missing = (msg: string) => {
  throw new Error(msg);
};

export async function handlePlaceBetEvent(event: Event) {
  const player = event.pubkey;
  const gameId =
    event.tags.find((t) => t[0] === "e" && t[3] === "game")?.[1] ||
    missing("event missing game id");
  const cashuToken =
    event.tags.find((t) => t[0] === "cashu")?.[1] ||
    missing("event missing cashu tokens");

  const game = await loadGame(gameId);
  if (game.finish) throw new Error("game finished");

  // decrypt the cashu tokens
  const decrypted = await nip04.decrypt(getSecKey(), player, cashuToken);
  const parsedToken = getDecodedToken(decrypted);

  if (parsedToken.token.length > 1)
    throw new Error("cant handle tokens with multiple mints yet");

  const mintUrl = parsedToken.token[0].mint;

  // get or create a wallet
  const wallet = await getWallet(mintUrl);

  // receive the token
  const { token } = await wallet.receive(decrypted);
  // throw an error if no proofs where received
  if (token.token.length === 0) throw new Error("token empty");

  // create the new token
  const newToken: Token = {
    token: token.token,
    memo: `bet from ${player}`,
  };

  const total = newToken.token.reduce(
    (v, t) => v + t.proofs.reduce((v, p) => v + p.amount, 0),
    0,
  );

  const postBetDraft: EventTemplate = {
    created_at: dayjs().unix(),
    kind: GameEventKinds.Bet as number,
    content: "",
    tags: [
      ["e", game.id, game.relay, "game"],
      ["p", player, game.relay, "player"],
      ["amount", String(total)],
      ["mint", mintUrl],
    ],
  };
  const postBetEvent = await finishEvent(postBetDraft, getSecKey());

  // save the full tokens for this bet
  const encodedToken = getEncodedToken(newToken);
  await saveFullTokenForBet(postBetEvent.id, encodedToken);

  // publish post bet event
  const relay = getRelay(game.relay);
  await ensureConnected(relay);
  await relay.publish(postBetEvent);
}
