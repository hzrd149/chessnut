import { Flex } from "@chakra-ui/react";
import useGames from "../../hooks/useGames";
import { useAuth } from "../../AuthProvider";

export default function FinishedGames() {
  const { pubkey } = useAuth();
  // const games = useGames(pubkey);

  return <Flex></Flex>;
}
