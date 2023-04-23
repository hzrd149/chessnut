import { Flex, Heading, Input, Text } from "@chakra-ui/react";
import { useAuthPubkey } from "../../AuthProvider";
import { useState } from "react";
import useGames from "../../hooks/useGames";
import { normalizeToHex } from "../../helpers/nip19";
import GameCard from "./GameCard";
import { withErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../../components/ErrorBoundary";
import InviteCard from "./InviteCard";

function CurrentChallenges() {
  const pubkey = useAuthPubkey();
  const games = useGames(pubkey);

  const [invite, setInvite] = useState("");

  return (
    <Flex direction="column">
      <Heading>Challenges</Heading>
      {games.length > 0 ? (
        <Flex direction="row" py="5" wrap="wrap" gap="4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} minW="sm" />
          ))}
        </Flex>
      ) : (
        <Flex direction="column" alignItems="center" py="10">
          <Heading size="md">No challenges.</Heading>
          <Text>Maybe tell your friends about ChessNut?</Text>
        </Flex>
      )}

      <Heading size="lg" mb="4">
        Create a new game
      </Heading>
      <Flex gap="2">
        <Input
          value={invite}
          onChange={(e) => setInvite(e.target.value)}
          placeholder="npub1..."
        />
      </Flex>

      {invite && (
        <Flex direction="column" alignItems="center" py="10">
          <InviteCard minW="sm" pubkey={normalizeToHex(invite)} />
        </Flex>
      )}
    </Flex>
  );
}

export default withErrorBoundary(CurrentChallenges, {
  FallbackComponent: ErrorFallback,
});
