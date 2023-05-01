import {
  Button,
  Flex,
  Heading,
  Input,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { normalizeToHex } from "../../helpers/nip19";
import GameCard from "./GameCard";
import { withErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../../components/ErrorBoundary";
import InviteCard from "./InviteCard";
import useGames from "../../hooks/useGames";
import { QrCodeIcon } from "../../components/Icons";
import QrScannerModal from "../../components/QrScannerModal";

function CurrentChallenges() {
  const toast = useToast();
  const games = useGames();

  const sortedGames = Array.from(games).sort((a, b) => b.created - a.created);

  const {
    isOpen: qrScannerOpen,
    onOpen: openScanner,
    onClose: closeScanner,
  } = useDisclosure();
  const [invite, setInvite] = useState("");

  return (
    <Flex direction="column">
      <Heading>Games</Heading>
      {sortedGames.length > 0 ? (
        <Flex direction="row" py="5" wrap="wrap" gap="4">
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
        <InviteCard w="full" maxW="sm" mt="4" pubkey={normalizeToHex(invite)} />
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
