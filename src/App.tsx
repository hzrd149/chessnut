import { Container } from "@chakra-ui/react";
import Header from "./components/Header";
import { useHash } from "react-use";
import HomeView from "./views/HomeView";
import { useAuth } from "./AuthProvider";
import GameView from "./views/GameView";

export default function App() {
  const [gameId] = useHash();
  const auth = useAuth();

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
      {auth.pubkey && (gameId ? <GameView /> : <HomeView />)}
    </Container>
  );
}
