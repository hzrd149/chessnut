import { Flex } from "@chakra-ui/react";
import { RELAY_URL } from "../const";
import { useRelaySub } from "../hooks/useRelaySub";
import { useSubEvents } from "../hooks/useSubEvents";

export default function CurrentGames() {
  const sub = useRelaySub("games", RELAY_URL, [{ kinds: [2500], limit: 10 }]);
  const events = useSubEvents(sub);

  return <Flex></Flex>;
}
