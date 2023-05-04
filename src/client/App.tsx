import { Container } from "@chakra-ui/react";
import Header from "./components/Header";
import { useHash } from "react-use";
import HomeView from "./views/HomeView";
import GameView from "./views/GameView";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { useNip04Tools } from "./hooks/useNip04Tools";
import { loadTokens } from "./services/wallet";

export default function App() {
  const [gameId] = useHash();
  const auth = useAuth();
  const { decrypt } = useNip04Tools();

  // load wallet whenever the auth changes
  useEffect(() => {
    loadTokens((cipherText: string) => decrypt(auth.pubkey, cipherText));
  }, [auth.pubkey, decrypt]);

  return (
    <Container
      size="lg"
      display="flex"
      flexDirection="column"
      height="100%"
      overflow="hidden"
      position="relative"
      padding="0"
    >
      <Header />
      {gameId ? <GameView /> : <HomeView />}
    </Container>
  );
}
