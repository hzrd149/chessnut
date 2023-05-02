import { useAsync, useHash, useSearchParam } from "react-use";
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
  Spacer,
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
import { useAuth } from "../../AuthProvider";
import { loadGameById } from "../../services/games";

function GameView() {
  const auth = useAuth();
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

  const { value: game, error } = useAsync(
    () => loadGameById(gameId, relay ?? undefined),
    [gameId]
  );
  if (error) return <Heading>Failed to load game {error.message}</Heading>;

  // update component when game changes
  useSignal(game?.onLoad);
  useSignal(game?.onState);
  useSignal(game?.onBet);

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

  if (!game?.loaded) return <Spinner />;
  if (!game) return <Heading>Failed to load game</Heading>;

  const isSpectator =
    auth.pubkey !== game.playerA && auth.pubkey !== game.playerB;
  const bets = game.getTotalBets();

  return (
    <>
      <Flex direction="column" gap="4" px="4" w="full" maxW="lg">
        <Flex flex="1" gap="4" alignItems="center">
          <Button onClick={() => newHash("")}>Back</Button>
          <UserAvatar pubkey={game.playerA} size="md" />
          <Text>VS</Text>
          <UserAvatar pubkey={game.playerB} size="md" />
        </Flex>
        <AspectRatio w="full" ratio={1}>
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
        <Flex gap="2" alignItems="center">
          <UserAvatar pubkey={game.playerA} size="md" />
          <Text>{bets[game.playerA]} sats</Text>
          <Spacer />
          <Text>{bets[game.playerB]} sats</Text>
          <UserAvatar pubkey={game.playerB} size="md" />
        </Flex>
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
