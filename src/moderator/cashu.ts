import { CashuMint, CashuWallet } from "@cashu/cashu-ts";

const mints = new Map<string, CashuMint>();
export function getMint(url: string) {
  if (!mints.has(url)) {
    const mint = new CashuMint(url);
    mints.set(url, mint);
    return mint;
  }
  return mints.get(url) as CashuMint;
}

const wallets = new Map<string, CashuWallet>();
export async function getWallet(mintUrl: string) {
  if (!wallets.has(mintUrl)) {
    const mint = getMint(mintUrl);
    const keys = await mint.getKeys();
    const wallet = new CashuWallet(mint, keys);
    wallets.set(mintUrl, wallet);
    return wallet;
  }
  return wallets.get(mintUrl) as CashuWallet;
}
