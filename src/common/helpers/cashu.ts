import type { Token } from "@cashu/cashu-ts/dist/lib/es5/model/types";

export function getTokenTotal(token: Token) {
  return token.token.reduce(
    (total, token) => total + token.proofs.reduce((v, p) => v + p.amount, 0),
    0,
  );
}
