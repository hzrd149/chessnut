import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { generatePrivateKey, getPublicKey } from "nostr-tools";

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
  const [secKey, setSecKey] = useState<string | undefined>(
    () => localStorage.getItem("key") ?? generatePrivateKey()
  );
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
