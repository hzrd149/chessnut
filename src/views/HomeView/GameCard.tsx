import {
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
import Game from "../../classes/game";

export default function GameCard({
  game,
  ...props
}: { game: Game } & CardProps) {
  const [hash, newHash] = useHash();

  return (
    <Card variant="outline" {...props}>
      <CardHeader>
        <Flex flex="1" gap="4" alignItems="center">
          <UserAvatar pubkey={game.playerA} />
          <Text>VS</Text>
          <UserAvatar pubkey={game.playerB} />
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
