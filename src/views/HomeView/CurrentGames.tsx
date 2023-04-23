import { Flex } from "@chakra-ui/react";
import useGames from "../../hooks/useGames";
import { useAuthPubkey } from "../../AuthProvider";

export default function CurrentGames() {
  const pubkey = useAuthPubkey();
  const games = useGames(pubkey);

  return <Flex></Flex>;
}
