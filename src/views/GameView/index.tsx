import { useHash, useSearchParam } from "react-use";
import useSingleEvent from "../../hooks/useSingleEvent";
import { RELAY_URL } from "../../const";
import { Box, Button, Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import { withErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../../components/ErrorBoundary";
import UserAvatar from "../../components/UserAvatar";
import Chessboard, { ChessboardProps } from "./Chessboard";
import Game from "../../classes/game";
import { useCallback, useEffect, useMemo } from "react";
import useSignal from "../../hooks/useSignal";
import { buildDraftMoveEvent } from "../../helpers/game-events";

function GameView() {
  const [hash, newHash] = useHash();
  const gameId = hash.replace("#", "");
  const relay = useSearchParam("relay");
  if (!gameId) return <Heading>Missing game id</Heading>;

  const gameEvent = useSingleEvent(relay ?? RELAY_URL, { ids: [gameId ?? ""] });

  const game = useMemo(() => {
    try {
      return gameEvent && new Game(gameEvent);
    } catch (e) {
      console.log("Failed to create game");
      console.log(e);
    }
  }, [gameEvent]);

  useSignal(game?.onChange);

  useEffect(() => {
    if (game) {
      if (import.meta.env.DEV) {
        //@ts-ignore
        window.currentGame = game;
      }

      game.load();
      return () => game.unload();
    }
  }, [game]);

  const handleMove = useCallback<NonNullable<ChessboardProps["onMove"]>>(
    (from, to, capturedPiece) => {
      if (!game) return;

      game.move(from, to);
      const draft = buildDraftMoveEvent(game, from, to);
      console.log(draft);
    },
    [game]
  );

  if (!gameEvent || !game?.loaded) return <Spinner />;
  if (!game) return <Heading>Failed to load game</Heading>;

  return (
    <Flex direction="column" gap="4">
      <Flex flex="1" gap="4" alignItems="center">
        <Button onClick={() => newHash("")}>Back</Button>
        <UserAvatar pubkey={game.playerA} size="md" />
        <Text>VS</Text>
        <UserAvatar pubkey={game.playerB} size="md" />
      </Flex>
      <Box w="lg" h="lg">
        <Chessboard game={game} onMove={handleMove} />
      </Box>
    </Flex>
  );
}

export default withErrorBoundary(GameView, {
  FallbackComponent: ErrorFallback,
});
