import { useHash, useSearchParam } from "react-use";
import useSingleEvent from "../../hooks/useSingleEvent";
import {
  AspectRatio,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  useToast,
  ButtonGroup,
  useDisclosure,
} from "@chakra-ui/react";
import { withErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../../components/ErrorBoundary";
import UserAvatar from "../../components/UserAvatar";
import Chessboard, { ChessboardProps } from "./Chessboard";
import { useCallback, useEffect, useMemo } from "react";
import useSignal from "../../hooks/useSignal";
import ChessGame from "../../../common/classes/chess-game";
import { useSigner } from "../../hooks/useSigner";
import { ensureConnected, getRelay } from "../../../common/services/relays";
import PlaceBetModal from "../../components/PlaceBetModal";
import { RELAY_URL } from "../../const";

function GameView() {
  const toast = useToast();
  const signer = useSigner();
  const [hash, newHash] = useHash();
  const gameId = hash.replace("#", "");
  const relay = useSearchParam("relay");
  const {
    isOpen: placeBetOpen,
    onClose: closePlaceBet,
    onOpen: openPlaceBet,
  } = useDisclosure();

  if (!gameId) return <Heading>Missing game id</Heading>;

  const gameEvent = useSingleEvent(relay ?? RELAY_URL, { ids: [gameId ?? ""] });

  const game = useMemo(() => {
    try {
      return gameEvent && new ChessGame(gameEvent);
    } catch (e) {
      console.log("Failed to create game");
      console.log(e);
    }
  }, [gameEvent]);

  // update component when game changes
  useSignal(game?.onLoad);
  useSignal(game?.onState);

  // load the game when the page mounts
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
    async (from, to, capturedPiece) => {
      if (!game) return;

      try {
        const draft = game.makeMove(from, to);
        const event = await signer(draft);
        const relay = getRelay(game.relay);
        await ensureConnected(relay);
        const pub = relay.publish(event);

        pub.on("ok", () => {
          game.handleStateEvent(event);
        });
      } catch (e) {
        if (e instanceof Error) {
          toast({ status: "error", description: e.message });
        }
      }
    },
    [game]
  );

  if (!gameEvent || !game?.loaded) return <Spinner />;
  if (!game) return <Heading>Failed to load game</Heading>;

  return (
    <>
      <Flex direction="column" gap="4" px="4">
        <Flex flex="1" gap="4" alignItems="center">
          <Button onClick={() => newHash("")}>Back</Button>
          <UserAvatar pubkey={game.playerA} size="md" />
          <Text>VS</Text>
          <UserAvatar pubkey={game.playerB} size="md" />
        </Flex>
        <AspectRatio w="full" ratio={1} maxW="lg">
          <Chessboard game={game} onMove={handleMove} />
        </AspectRatio>
        <ButtonGroup w="full">
          <Button flex={2} colorScheme="purple" onClick={openPlaceBet}>
            Place bet
          </Button>
          <Button flex={1} variant="outline" colorScheme="blue">
            Draw
          </Button>
          <Button flex={1} variant="outline" colorScheme="red">
            Forfeit
          </Button>
        </ButtonGroup>
        <Text>turn: {game.chess.turn()}</Text>
        <Text>isCheck: {game.chess.isCheck() ? "true" : "false"}</Text>
        <Text>isCheckmate: {game.chess.isCheckmate() ? "true" : "false"}</Text>
        <Text>isDraw: {game.chess.isDraw() ? "true" : "false"}</Text>
      </Flex>
      {placeBetOpen && (
        <PlaceBetModal
          game={game}
          isOpen={placeBetOpen}
          onClose={closePlaceBet}
        />
      )}
    </>
  );
}

export default withErrorBoundary(GameView, {
  FallbackComponent: ErrorFallback,
});
