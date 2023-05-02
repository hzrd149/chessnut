import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Switch,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { normalizeToHex } from "../../helpers/nip19";
import GameCard from "./GameCard";
import { withErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../../components/ErrorBoundary";
import InviteCard from "./InviteCard";
import useGames from "../../hooks/useGames";
import { QrCodeIcon } from "../../components/Icons";
import QrScannerModal from "../../components/QrScannerModal";
import { useMeasure } from "react-use";

function CurrentChallenges() {
  const toast = useToast();
  const games = useGames();
  const [filter, setFilter] = useState("ongoing");
  const [showNoBets, setShowNoBets] = useState(false);

  const filteredGames = useMemo(() => {
    switch (filter) {
      case "ongoing":
        return games.filter((game) => !game.finish && game.states.size > 0);
      case "challenges":
        return games.filter((game) => !game.finish && game.states.size === 0);
      case "finished":
        return games.filter((game) => !!game.finish);
      default:
        return Array.from(games);
    }
  }, [filter, games]);

  const filteredGamesWithBets = showNoBets
    ? filteredGames
    : filteredGames.filter((game) => game.bets.size > 0);

  const sortedGames = Array.from(filteredGamesWithBets).sort(
    (a, b) => b.created - a.created
  );

  const {
    isOpen: qrScannerOpen,
    onOpen: openScanner,
    onClose: closeScanner,
  } = useDisclosure();
  const [invite, setInvite] = useState("");

  return (
    <Flex direction="column">
      <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="ongoing">On-going</option>
        <option value="challenges">Challenges</option>
        <option value="finished">Finished</option>
      </Select>
      <FormControl display="flex" alignItems="center" mt="2">
        <Switch
          id="show-no-bets"
          checked={showNoBets}
          onChange={(e) => setShowNoBets(e.target.checked)}
          mr="2"
        />
        <FormLabel htmlFor="show-no-bets" mb="0">
          Show games with no bets
        </FormLabel>
      </FormControl>

      {sortedGames.length > 0 ? (
        <Flex direction="row" py="4" wrap="wrap" gap="4">
          {sortedGames.map((game) => (
            <GameCard key={game.id} game={game} w="sm" maxW="full" />
          ))}
        </Flex>
      ) : (
        <Flex direction="column" alignItems="center" py="10">
          <Heading size="md">No games</Heading>
          <Text>Maybe tell your friends about ChessNut?</Text>
        </Flex>
      )}

      <Heading size="lg" mb="4">
        Create a new game
      </Heading>
      <Flex gap="2">
        <Button
          w="full"
          onClick={openScanner}
          leftIcon={<QrCodeIcon />}
          aria-label="Qr Scanner"
        >
          Scan Npub
        </Button>
        <Input
          value={invite}
          onChange={(e) => setInvite(e.target.value)}
          placeholder="paste npub"
        />
      </Flex>

      {invite && (
        <InviteCard
          w="full"
          maxW="sm"
          mt="4"
          pubkey={normalizeToHex(invite)}
          onCreateGame={() => setInvite("")}
        />
      )}

      {qrScannerOpen && (
        <QrScannerModal
          isOpen={qrScannerOpen}
          onClose={closeScanner}
          header="Scan QR npub"
          onData={(data) => {
            setInvite(normalizeToHex(data));
          }}
        />
      )}
    </Flex>
  );
}

export default withErrorBoundary(CurrentChallenges, {
  FallbackComponent: ErrorFallback,
});
