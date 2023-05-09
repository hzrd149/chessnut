import { useAsync, useHash, useSearchParam } from "react-use";
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
import Chessboard from "./Chessboard";
import { useCallback, useEffect } from "react";
import useSignal from "../../hooks/useSignal";
import { useSigner } from "../../hooks/useSigner";
import { getRelay } from "../../../common/services/relays";
import PlaceBetModal from "../../components/PlaceBetModal";
import { useAuth } from "../../AuthProvider";
import { loadGameById } from "../../services/games";
import ForFeitModal from "./ForfeitModal";
import { ensureConnected, waitForPub } from "../../../common/helpers/relays";
import RewardModal from "../../components/RewardModal";
import { GameTypes } from "../../../common/enum";
import ChessGame from "../../../common/classes/chess-game";
import TicTacToeGame from "../../../common/classes/tic-tac-toe-game";
import TicTacToeBoard from "./TicTacToeBoard";

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
  const forfeitModal = useDisclosure();
  const rewardModal = useDisclosure();

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
  useSignal(game?.onFinish);

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

  const handleMove = useCallback(
    async (move: string) => {
      if (!game) return;

      try {
        const draft = game.buildMoveEvent(move);
        const event = await signer(draft);
        const relay = getRelay(game.relay);
        await ensureConnected(relay);
        const pub = relay.publish(event);
        await waitForPub(pub);
        game.handleStateEvent(event);
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
  const playerBets = game.getPlayerBets();

  const renderGameboard = () => {
    switch (game.type) {
      case GameTypes.Chess:
        return <Chessboard game={game as ChessGame} onMove={handleMove} />;
      case GameTypes.TicTacToe:
        return (
          <TicTacToeBoard game={game as TicTacToeGame} onMove={handleMove} />
        );
    }
  };

  let hasRewards = !!game.finish?.rewards[auth.pubkey];

  return (
    <>
      <Flex direction="column" gap="4" px="4" w="full" maxW="lg">
        <Flex flex="1" gap="4" alignItems="center">
          <Button onClick={() => newHash("")}>Back</Button>
          <UserAvatar pubkey={game.playerA} size="md" />
          <Text>VS</Text>
          <UserAvatar pubkey={game.playerB} size="md" />
        </Flex>
        {renderGameboard()}
        {game.isOver && hasRewards ? (
          <ButtonGroup w="full">
            <Button flex={1} colorScheme="purple" onClick={rewardModal.onOpen}>
              Collect reward
            </Button>
          </ButtonGroup>
        ) : (
          <ButtonGroup w="full">
            <Button
              flex={2}
              colorScheme="purple"
              onClick={openPlaceBet}
              isDisabled={game.isOver}
            >
              Place bet
            </Button>
            <Button flex={1} variant="outline" colorScheme="blue" isDisabled>
              Draw
            </Button>
            <Button
              flex={1}
              variant="outline"
              colorScheme="red"
              onClick={forfeitModal.onOpen}
              isDisabled={game.isOver}
            >
              Forfeit
            </Button>
          </ButtonGroup>
        )}
        <Flex gap="2" alignItems="center">
          <UserAvatar pubkey={game.playerA} size="md" />
          <Text>{playerBets[game.playerA]} sats</Text>
          <Spacer />
          <Text>{playerBets[game.playerB]} sats</Text>
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
      {forfeitModal.isOpen && (
        <ForFeitModal
          isOpen={forfeitModal.isOpen}
          onClose={forfeitModal.onClose}
          game={game}
          onForfeit={forfeitModal.onClose}
        />
      )}
      {rewardModal.isOpen && (
        <RewardModal
          isOpen={rewardModal.isOpen}
          onClose={rewardModal.onClose}
          game={game}
        />
      )}
    </>
  );
}

export default withErrorBoundary(GameView, {
  FallbackComponent: ErrorFallback,
});
