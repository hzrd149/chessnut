import { CashuMint, CashuWallet } from "@cashu/cashu-ts";

const DEFAULT_MINT = import.meta.env.VITE_MINT_URL;
console.log(`Default mint: ${DEFAULT_MINT}`);

const mints = new Map<string, CashuMint>();
export function getMint(url: string = DEFAULT_MINT) {
  if (!mints.has(url)) {
    const mint = new CashuMint(url);
    mints.set(url, mint);
    return mint;
  }
  return mints.get(url) as CashuMint;
}

const wallets = new Map<string, CashuWallet>();
export async function getWallet(mintUrl: string = DEFAULT_MINT) {
  if (!wallets.has(mintUrl)) {
    const mint = getMint(mintUrl);
    const keys = await mint.getKeys();
    const wallet = new CashuWallet(keys, mint);
    wallets.set(mintUrl, wallet);
    return wallet;
  }
  return wallets.get(mintUrl) as CashuWallet;
}

if (import.meta.env.DEV) {
  // @ts-ignore
  window.cashuService = {
    getMint,
    getWallet,
  };
}
