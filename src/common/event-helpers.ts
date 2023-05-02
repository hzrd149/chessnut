import { Proof } from "@cashu/cashu-ts";
import { Event } from "nostr-tools";
import { GameEventKinds } from "./const.js";

export enum StateTypes {
  Move = "move",
}

export type ParsedState = {
  id: string;
  author: string;
  kind: number;
  state: string;
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

  const stateStr = event.tags.find((t) => t[0] === "state")?.[1];
  if (!stateStr) throw new Error("missing state");

  const previous = event.tags.find(
    (t) => t[0] === "e" && t[3] === "previous"
  )?.[1];
  if (!previous) throw new Error("missing previous");

  const move = event.tags.find((t) => t[0] === "move")?.[1];
  if (!move) throw new Error("missing moved");

  return {
    id: event.id,
    author: event.pubkey,
    kind: event.kind as number,
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
  amount: number;
  proofs: Proof[];
  game: string;
};

export function parseBetEvent(event: Event): ParsedBet {
  if ((event.kind as number) !== GameEventKinds.Bet)
    throw new Error("event is not a bet event");

  const game = event.tags.find((t) => t[0] === "e" && t[3] === "game")?.[1];
  if (!game) throw new Error("missing game");

  const player = event.tags.find((t) => t[0] === "p" && t[3] === "player")?.[1];
  if (!player) throw new Error("missing player");

  const proofsStr = event.tags.find((t) => t[0] === "proofs")?.[1];
  if (!proofsStr) throw new Error("missing proofs");

  const proofs = JSON.parse(proofsStr) as Proof[];
  const amount = proofs.reduce((a, proof) => a + proof.amount, 0);

  return {
    id: event.id,
    player,
    proofs,
    game,
    amount,
  };
}
