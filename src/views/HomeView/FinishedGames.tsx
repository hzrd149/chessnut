import { Flex } from "@chakra-ui/react";
import useGames from "../../hooks/useGames";
import { useAuthPubkey } from "../../AuthProvider";

export default function FinishedGames() {
  const pubkey = useAuthPubkey();
  // const games = useGames(pubkey);

  return <Flex></Flex>;
}
