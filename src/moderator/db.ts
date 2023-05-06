import Keyv from "keyv";

if (process.env.DB_PATH) {
  console.log(`Using ${process.env.DB_PATH}`);
} else console.log("Using in memory database");

const db = new Keyv(process.env.DB_PATH);

export async function saveFullTokenForBet(betId: string, token: string) {
  const has = await db.has(betId);
  if (has) throw new Error(`already storing tokens for this bet ${betId}`);
  await db.set(betId, token);
}
export async function getFullTokenForBet(betId: string) {
  return (await db.get(betId)) as Promise<string | undefined>;
}
