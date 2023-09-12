import { Event } from "nostr-tools";
import { GameEventKinds, GameFinishReasons } from "../enum.js";

const getGameId = (event: Event) =>
  event.tags.find((t) => t[0] === "e" && t[3] === "game")?.[1];

export enum StateTypes {
  Move = "move",
  Forfeit = "forfeit",
  Draw = "draw",
}

export type ParsedState = {
  id: string;
  author: string;
  kind: number;
  game: string;
  state?: string;
  type: StateTypes;
  previous: string;
  move?: string;
  event: Event;
};

export function parseStateEvent(event: Event): ParsedState {
  if ((event.kind as number) !== GameEventKinds.State)
    throw new Error("event is not a state event");

  const type = event.tags.find((t) => t[0] === "type")?.[1] as
    | StateTypes
    | undefined;
  if (!type) throw new Error("missing type");

  const game = getGameId(event);
  if (!game) throw new Error("missing game");

  const stateStr = event.tags.find((t) => t[0] === "state")?.[1];

  const previous = event.tags.find(
    (t) => t[0] === "e" && t[3] === "previous",
  )?.[1];
  if (!previous) throw new Error("missing previous");

  const move = event.tags.find((t) => t[0] === "move")?.[1];

  return {
    id: event.id,
    author: event.pubkey,
    kind: event.kind as number,
    game,
    state: stateStr,
    type,
    previous,
    move,
    event,
  };
}

export type ParsedBet = {
  id: string;
  player: string;
  game: string;
  amount: number;
  mint: string;
};

export function parseBetEvent(event: Event): ParsedBet {
  if ((event.kind as number) !== GameEventKinds.Bet)
    throw new Error("event is not a bet event");

  const game = getGameId(event);
  if (!game) throw new Error("missing game");

  const player = event.tags.find((t) => t[0] === "p" && t[3] === "player")?.[1];
  if (!player) throw new Error("missing player");

  const amount = event.tags.find((t) => t[0] === "amount")?.[1];
  if (!amount) throw new Error("missing amount");

  const mint = event.tags.find((t) => t[0] === "mint")?.[1];
  if (!mint) throw new Error("missing mint");

  return {
    id: event.id,
    player,
    game,
    amount: parseInt(amount),
    mint,
  };
}

export type ParsedFinish = {
  id: string;
  reason: GameFinishReasons;
  players: string[];
  winner?: string;
  game: string;
  author: string;
  rewards: Record<string, string>;
};

export function parseFinishEvent(event: Event): ParsedFinish {
  if ((event.kind as number) !== GameEventKinds.Finish)
    throw new Error("event is not a finish event");

  const game = getGameId(event);
  if (!game) throw new Error("missing game");

  const reason = event.tags.find((t) => t[0] === "reason")?.[1] as
    | GameFinishReasons
    | undefined;
  if (!reason) throw new Error("missing reason");

  const players = event.tags
    .filter((t) => t[0] === "p" && t[3] === "player")
    .map((t) => t[1]);
  if (players.length === 0) throw new Error("missing winner");

  const winner = event.tags.find((t) => t[0] === "winner")?.[1];

  const rewards: Record<string, string> = {};
  event.tags
    .filter((t) => t[0] === "cashu")
    .map((t) => {
      if (t[1] && t[2]) {
        rewards[t[2]] = t[1];
      }
    });

  return {
    id: event.id,
    author: event.pubkey,
    reason,
    game,
    players,
    winner,
    rewards,
  };
}
