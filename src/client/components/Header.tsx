import {
  Flex,
  Heading,
  IconButton,
  Image,
  Spacer,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useInterval } from "react-use";
import { useState } from "react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

import { getRelay } from "../../common/services/relays";
import { useAuth } from "../AuthProvider";
import UserAvatar from "./UserAvatar";
import ProfileModal from "./ProfileModal";
import { RELAY_URL } from "../const";

export default function Header() {
  const { toggleColorMode, colorMode } = useColorMode();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [connected, setConnected] = useState(false);
  useInterval(() => {
    setConnected(getRelay(RELAY_URL).status === WebSocket.OPEN);
  });

  const auth = useAuth();

  return (
    <>
      <Flex p="2" alignItems="center">
        <Image src="./icon.svg" w="8" mr="2" />
        <Heading size="lg" isTruncated>
          ChessNut
        </Heading>
        <Spacer />
        <IconButton
          icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
          aria-label="Toggle color mode"
          variant="ghost"
          mr="4"
          onClick={() => toggleColorMode()}
        />
        <UserAvatar
          pubkey={auth.pubkey}
          onClick={onOpen}
          cursor="pointer"
          badgeColor={connected ? "green.500" : "orange.500"}
        />
      </Flex>
      {isOpen && <ProfileModal isOpen={isOpen} onClose={onClose} />}
    </>
  );
}
