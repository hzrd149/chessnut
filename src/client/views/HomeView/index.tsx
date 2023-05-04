import { Box } from "@chakra-ui/react";
import CurrentChallenges from "./CurrentChallenges";

export default function HomeView() {
  return (
    <Box px="4" pb="8">
      <CurrentChallenges />
    </Box>
  );
}
