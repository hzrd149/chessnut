import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  Flex,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import UserAvatar from "../../components/UserAvatar";
import { useHash } from "react-use";
import Game from "../../../common/classes/game";
import useSignal from "../../hooks/useSignal";
import { useAuth } from "../../AuthProvider";
import RewardModal from "../../components/RewardModal";

export default function GameCard({
  game,
  ...props
}: { game: Game } & CardProps) {
  const auth = useAuth();
  const [hash, newHash] = useHash();
  const rewardModal = useDisclosure();

  useSignal(game.onLoad);
  const bets = game.getPlayerBets();

  const isWinner = game.isOver && game.getWinner() === auth.pubkey;

  return (
    <>
      <Card variant="outline" {...props}>
        <CardHeader>
          <Flex
            flex="1"
            gap="4"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <UserAvatar pubkey={game.playerA} />
              <Text>{bets[game.playerA]} sats</Text>
            </Box>
            <Text>VS</Text>
            <Box>
              <UserAvatar pubkey={game.playerB} />
              <Text>{bets[game.playerB]} sats</Text>
            </Box>
          </Flex>
        </CardHeader>
        <CardBody py="0">
          <Text whiteSpace="pre">{game.message}</Text>
        </CardBody>
        <CardFooter>
          <ButtonGroup w="full">
            <Button
              color="purple"
              variant="outline"
              onClick={() => newHash(game.id)}
              w="full"
            >
              View
            </Button>

            {isWinner && (
              <Button
                onClick={rewardModal.onOpen}
                w="full"
                colorScheme="purple"
              >
                Collect Reward
              </Button>
            )}
          </ButtonGroup>
        </CardFooter>
      </Card>
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
