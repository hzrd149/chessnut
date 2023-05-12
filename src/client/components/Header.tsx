import {
  Badge,
  Button,
  DarkMode,
  Flex,
  Heading,
  Icon,
  IconButton,
  Image,
  Spacer,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useInterval } from "react-use";
import { useMemo, useState } from "react";
import { getRelay } from "../../common/services/relays";
import { useAuth } from "../AuthProvider";
import UserAvatar from "./UserAvatar";
import ProfileModal from "./ProfileModal";
import { RELAY_URL } from "../const";
import { MoonIcon, SettingsIcon, SunIcon } from "@chakra-ui/icons";
// import { LightningIcon } from "./Icons";
import { getTokens, onChange } from "../services/wallet";
// import { Token } from "@cashu/cashu-ts/dist/lib/es5/model/types";
import { getTokenTotal } from "../../common/helpers/cashu";
// import WalletModal from "./WalletModal";
import useSignal from "../hooks/useSignal";

export default function Header() {
  const { toggleColorMode, colorMode } = useColorMode();
  const { isOpen, onClose, onOpen } = useDisclosure();
  // const {
  //   isOpen: walletOpen,
  //   onClose: closeWallet,
  //   onOpen: openWallet,
  // } = useDisclosure();
  const [connected, setConnected] = useState(false);
  useInterval(() => {
    setConnected(getRelay(RELAY_URL).status === WebSocket.OPEN);
  });

  const auth = useAuth();

  useSignal(onChange);
  const total = getTokens().reduce((v, token) => v + getTokenTotal(token), 0);

  return (
    <>
      <Flex p="2" alignItems="center">
        <Image src="./icon.svg" w="8" mr="2" />
        <Heading size="lg" isTruncated>
          ChessNut
        </Heading>
        {/* <Button
          ml="2"
          variant="ghost"
          leftIcon={<LightningIcon color="yellow.400" />}
          onClick={openWallet}
        >
          {total}
        </Button> */}
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
      {/* {walletOpen && <WalletModal isOpen={walletOpen} onClose={closeWallet} />} */}
    </>
  );
}
