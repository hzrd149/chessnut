import { Flex } from "@chakra-ui/react";
import useGames from "../../hooks/useGames";

export default function CurrentGames() {
  const games = useGames();

  return <Flex></Flex>;
}
