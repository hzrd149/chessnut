import { Chessground as LichessChessground } from "chessground";
import { Chess, Color } from "chess.js";

export type ChessgroundConfig = NonNullable<
  Parameters<typeof LichessChessground>[1]
>;

export function shortColorToLong(
  c: Color
): NonNullable<ChessgroundConfig["orientation"]> {
  return c === "w" ? "white" : "black";
}

type Dests = NonNullable<NonNullable<ChessgroundConfig["movable"]>["dests"]>;
export function chessJsMovesToDests(chess: Chess) {
  const dests: Dests = new Map();
  const moves = chess.moves({ verbose: true });

  for (const move of moves) {
    const cells = dests.get(move.from) ?? [];
    cells.push(move.to);
    dests.set(move.from, cells);
  }

  return dests;
}
