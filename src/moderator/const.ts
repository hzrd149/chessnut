const missing = (env: string) => {
  throw new Error(`Missing ${env}`);
};

export const RELAY_URL = process.env.RELAY_URL || missing("RELAY_URL");
export const NOSTR_NSEC = process.env.NOSTR_NSEC || missing("NOSTR_NSEC");
