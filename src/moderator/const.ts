const missing = (env: string) => {
  throw new Error(`Missing ${env}`);
};

export const RELAY_URL = process.env.RELAY_URL || missing("RELAY_URL");
export const MOD_NSEC = process.env.MOD_NSEC || missing("MOD_NSEC");
