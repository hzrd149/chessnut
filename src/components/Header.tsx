import { Badge, Button, Flex, Heading, Spacer } from "@chakra-ui/react";
import { RELAY_URL } from "../const";
import { useInterval } from "react-use";
import { useState } from "react";
import { getRelay } from "../services/relays";
import { useAuth } from "../AuthProvider";
import UserAvatar from "./UserAvatar";

export default function Header() {
  const [connected, setConnected] = useState(false);
  useInterval(() => {
    setConnected(getRelay(RELAY_URL).status === WebSocket.OPEN);
  });

  const auth = useAuth();

  return (
    <Flex p="2" alignItems="center">
      <Heading size="lg" isTruncated>
        ChessNut
        <Badge
          ml="4"
          colorScheme={connected ? "green" : "orange"}
          fontSize="0.5em"
        >
          {RELAY_URL}
        </Badge>
      </Heading>

      <Spacer />
      <Button colorScheme="purple" onClick={auth.loginWithNip07} mr="4">
        Login
      </Button>
      <UserAvatar pubkey={auth.pubkey} />
    </Flex>
  );
}
