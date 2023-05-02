import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  Flex,
  Text,
} from "@chakra-ui/react";
import UserAvatar from "../../components/UserAvatar";
import { useHash } from "react-use";
import Game from "../../../common/classes/game";
import useSignal from "../../hooks/useSignal";

export default function GameCard({
  game,
  ...props
}: { game: Game } & CardProps) {
  const [hash, newHash] = useHash();

  useSignal(game.onLoad);
  const bets = game.getTotalBets();

  return (
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
        <Button
          color="purple"
          variant="outline"
          w="full"
          onClick={() => newHash(game.id)}
        >
          View
        </Button>
      </CardFooter>
    </Card>
  );
}
