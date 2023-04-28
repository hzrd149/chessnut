import {
  Flex,
  Heading,
  IconButton,
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
import { nip19 } from "nostr-tools";

function CurrentChallenges() {
  const toast = useToast();
  const games = useGames();

  const {
    isOpen: qrScannerOpen,
    onOpen: openScanner,
    onClose: closeScanner,
  } = useDisclosure();
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
        <IconButton
          onClick={openScanner}
          icon={<QrCodeIcon />}
          aria-label="Qr Scanner"
        />
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

      {qrScannerOpen && (
        <QrScannerModal
          isOpen={qrScannerOpen}
          onClose={closeScanner}
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
