import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  useToast,
} from "@chakra-ui/react";
import Game from "../../../common/classes/game";
import { useAuth } from "../../AuthProvider";
import { useState } from "react";
import { buildForfeitEvent } from "../../helpers/events";
import { useSigner } from "../../hooks/useSigner";
import { getRelay } from "../../../common/services/relays";
import { Event } from "nostr-tools";
import { ensureConnected, waitForPub } from "../../../common/helpers/relays";

export default function ForFeitModal({
  game,
  isOpen,
  onClose,
  onForfeit,
  ...props
}: { game: Game; onForfeit?: (event: Event) => void } & Omit<
  ModalProps,
  "children"
>) {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const signer = useSigner();

  const totalBets = game.getPlayerBets()[auth.pubkey];

  const handleForfeit = async () => {
    setLoading(true);
    try {
      const draft = buildForfeitEvent(game);
      const event = await signer(draft);
      const relay = getRelay(game.relay);
      await ensureConnected(relay);
      const pub = relay.publish(event);
      await waitForPub(pub);
      if (onForfeit) onForfeit(event);
    } catch (e) {
      if (e instanceof Error) {
        toast({
          status: "error",
          description: e.message,
        });
      }
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={!loading}
      closeOnEsc={!loading}
      {...props}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Forfeit game</ModalHeader>
        <ModalCloseButton />
        {totalBets && (
          <ModalBody py="0">
            If you forfeit the game you will loose{" "}
            {game.getPlayerBets()[auth.pubkey]} sats
          </ModalBody>
        )}

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button
            variant="solid"
            colorScheme="red"
            isLoading={loading}
            onClick={handleForfeit}
          >
            Forfeit game
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
