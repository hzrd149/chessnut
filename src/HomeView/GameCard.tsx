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
import { ParsedGame } from "../helpers/game-events";
import UserAvatar from "../components/UserAvatar";

export default function GameCard({
  game,
  ...props
}: { game: ParsedGame } & CardProps) {
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
          onClick={() => (location.search = "?game=" + game.id)}
        >
          View
        </Button>
      </CardFooter>
    </Card>
  );
}
