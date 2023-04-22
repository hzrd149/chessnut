import { PropsWithChildren, createContext, useContext, useState } from "react";

export type AuthContext = {
  pubkey: string | null;
  nip07: boolean;
  loginWithNip07: () => void;
};

const AuthContext = createContext<AuthContext>({
  pubkey: null,
  nip07: false,
  loginWithNip07: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
export function useAuthPubkey() {
  const auth = useContext(AuthContext);
  if (!auth.pubkey) throw new Error("no pubkey");
  return auth.pubkey;
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [nip07, setNip07] = useState(false);

  const loginWithNip07 = async () => {
    if (window.nostr) {
      const p = await window.nostr.getPublicKey();
      setPubkey(p);
      setNip07(true);
    }
  };

  return (
    <AuthContext.Provider value={{ pubkey, nip07, loginWithNip07 }}>
      {children}
    </AuthContext.Provider>
  );
}
