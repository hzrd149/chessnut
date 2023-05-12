import {
  Button,
  Heading,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Text,
} from "@chakra-ui/react";

const linkProps = {
  isExternal: true,
  target: "_blank",
  color: "blue.500",
};

export default function WelcomeModal({
  isOpen,
  onClose,
  ...props
}: Omit<ModalProps, "children">) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader p="4">Welcome to ChessNut</ModalHeader>
        <ModalCloseButton />
        <ModalBody px="4" pt="0" pb="4">
          <Text>
            ChessNut is an experimental{" "}
            <Link href="https://nostr.com" {...linkProps}>
              Nostr
            </Link>{" "}
            Client that lets players challenge each other to a chess or a
            tic-tac-toe game and place bets with{" "}
            <Link href="https://cashu.space" {...linkProps}>
              Cashu
            </Link>{" "}
            tokens (Nuts)
          </Text>
          <Heading size="md" mt="4">
            How to play:
          </Heading>
          <Text>1. Start by scanning another users Npub</Text>
          <Text>
            2. Select either "Chess" or "Tic-Tac-Toe" as the game mode and click
            "Create game"
          </Text>
          <Text>
            3. In the game view you can click the "Place bet" button to pay a
            lightning invoice and put some nuts on the line
          </Text>
          <Text>4. Win the game</Text>
          <Text>
            5. Collect the nuts using a{" "}
            <Link href="https://cashu.space/" {...linkProps}>
              cashu wallet
            </Link>
          </Text>
          <Heading size="md" mt="4">
            How do the bets work?
          </Heading>
          <Text>
            At any point during the game you can place a bet by paying a
            lightning invoice
          </Text>
          <Text>
            Once the invoice is paid the moderator is post the bet so both
            players can see it
          </Text>
          <Text>
            When the game is finished the moderator will take all bets and send
            them to the winning player (or return them in the case of a draw)
          </Text>
          <Heading size="md" mt="4">
            What is the moderator?
          </Heading>
          <Text>
            The moderator is a small program that runs in the cloud and holds
            onto the nuts while the game is being played
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
