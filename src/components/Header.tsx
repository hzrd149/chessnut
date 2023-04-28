import {
  Badge,
  Button,
  Flex,
  Heading,
  Spacer,
  useDisclosure,
} from "@chakra-ui/react";
import { RELAY_URL } from "../const";
import { useInterval } from "react-use";
import { useState } from "react";
import { getRelay } from "../services/relays";
import { useAuth } from "../AuthProvider";
import UserAvatar from "./UserAvatar";
import ProfileModal from "./ProfileModal";

export default function Header() {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [connected, setConnected] = useState(false);
  useInterval(() => {
    setConnected(getRelay(RELAY_URL).status === WebSocket.OPEN);
  });

  const auth = useAuth();

  return (
    <>
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
        <UserAvatar pubkey={auth.pubkey} onClick={onOpen} cursor="pointer" />
      </Flex>
      {isOpen && <ProfileModal isOpen={isOpen} onClose={onClose} />}
    </>
  );
}
