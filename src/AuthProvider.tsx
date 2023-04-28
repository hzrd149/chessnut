import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  EventTemplate,
  Kind,
  generatePrivateKey,
  getPublicKey,
  finishEvent,
} from "nostr-tools";
import { ensureConnected, getRelay } from "./services/relays";
import { RELAY_URL } from "./const";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import dayjs from "dayjs";

async function publishInitialMetadata(secKey: string) {
  const relay = getRelay(RELAY_URL);
  await ensureConnected(relay);

  const metadata = {
    display_name: uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: " ",
      style: "capital",
    }),
    picture: "",
  };

  const draft: EventTemplate = {
    kind: Kind.Metadata,
    created_at: dayjs().unix(),
    content: JSON.stringify(metadata),
    tags: [],
  };
  const event = await finishEvent(draft, secKey);
  relay.publish(event);
}

export type AuthContext = {
  pubkey: string;
  secKey?: string;
  nip07: boolean;
  loginWithNip07: () => void;
};

const AuthContext = createContext<AuthContext>({
  pubkey: "bad",
  secKey: undefined,
  nip07: false,
  loginWithNip07: () => {},
});

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth.pubkey) throw new Error("no pubkey");
  return auth;
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const [secKey, setSecKey] = useState<string | undefined>(() => {
    let secKey = localStorage.getItem("key") ?? undefined;
    if (secKey) return secKey;

    // create new ID
    secKey = generatePrivateKey();
    publishInitialMetadata(secKey);
    return secKey;
  });
  const [pubkey, setPubkey] = useState<string>(() =>
    getPublicKey(secKey as string)
  );
  const [nip07, setNip07] = useState(false);

  // save the secKey when it changes
  useEffect(() => {
    if (secKey) localStorage.setItem("key", secKey);
  }, [secKey]);

  // login with extension
  const loginWithNip07 = async () => {
    if (window.nostr) {
      const p = await window.nostr.getPublicKey();
      setPubkey(p);
      setSecKey(undefined);
      setNip07(true);
    }
  };

  return (
    <AuthContext.Provider value={{ secKey, pubkey, nip07, loginWithNip07 }}>
      {children}
    </AuthContext.Provider>
  );
}
