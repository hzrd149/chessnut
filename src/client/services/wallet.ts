import { Token } from "@cashu/cashu-ts/dist/lib/es5/model/types";
import {
  ensureConnected,
  getRelay,
  waitForPub,
} from "../../common/services/relays";
import { RELAY_URL } from "../const";
import Signal from "../../common/classes/signal";
import { Event, EventTemplate } from "nostr-tools";
import dayjs from "dayjs";
import { getDecodedToken } from "@cashu/cashu-ts";

const tokens = new Set<Token>();

export const onChange = new Signal();

export async function loadTokens(
  decrypt: (cipherText: string) => Promise<string>
) {
  tokens.clear();
  const relay = getRelay(RELAY_URL);
  ensureConnected(relay);
  const event = await relay.get({ kinds: [30078], "#d": ["chessnut-wallet"] });
  if (!event) return;
  const decrypted = await decrypt(event.content);
  const parsedTokens = JSON.parse(decrypted) as Token[];
  for (const token of parsedTokens) {
    tokens.add(token);
  }

  onChange.notify();
  return Array.from(tokens);
}

export function addTokenFromString(nut: string) {
  const token = getDecodedToken(nut);
  addToken(token);
}

export function addToken(token: Token) {
  tokens.add(token);
  onChange.notify();
}

export async function saveTokens(
  sign: (draft: EventTemplate) => Promise<Event>,
  encrypt: (text: string) => Promise<string>
) {
  const relay = getRelay(RELAY_URL);
  ensureConnected(relay);

  const event = await sign({
    kind: 30078 as number,
    tags: [["d", "chessnut-wallet"]],
    content: await encrypt(JSON.stringify(getTokens())),
    created_at: dayjs().unix(),
  });

  await waitForPub(relay.publish(event));
}

export function getTokens() {
  return Array.from(tokens);
}

if (import.meta.env.DEV) {
  // @ts-ignore
  window.walletService = {
    loadTokens,
    saveTokens,
    addToken,
  };
}
