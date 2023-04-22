import { useSearchParam } from "react-use";
import useSingleEvent from "../hooks/useSingleEvent";
import { RELAY_URL } from "../const";
import { Button, Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import { withErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../components/ErrorBoundary";
import UserAvatar from "../components/UserAvatar";
import { arraySafeParse } from "../helpers/array";
import { parseGameEvent } from "../helpers/game-events";
import Chessboard from "./Chessboard";

function GameView() {
  const gameId = useSearchParam("game");
  const relay = useSearchParam("relay");
  if (!gameId) return <Heading>Missing game id</Heading>;

  const gameEvent = useSingleEvent(relay ?? RELAY_URL, { ids: [gameId ?? ""] });
  if (!gameEvent) return <Spinner />;

  const game = arraySafeParse([gameEvent], parseGameEvent)[0];

  return (
    <Flex direction="column" gap="4">
      <Flex flex="1" gap="4" alignItems="center">
        <Button onClick={() => (location.search = "")}>Back</Button>
        <UserAvatar pubkey={game.playerA} size="md" />
        <Text>VS</Text>
        <UserAvatar pubkey={game.playerB} size="md" />
      </Flex>
      <Chessboard game={game} />
    </Flex>
  );
}

export default withErrorBoundary(GameView, {
  FallbackComponent: ErrorFallback,
});
