import { Event } from "nostr-tools";

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
  if ((event.kind as number) !== 2501)
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
