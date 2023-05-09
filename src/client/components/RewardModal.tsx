import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalProps,
  Text,
  Button,
  Input,
  useToast,
  Flex,
  Link,
} from "@chakra-ui/react";
import Game from "../../common/classes/game";
import { useAuth } from "../AuthProvider";
import { useState } from "react";
import { useNip04Tools } from "../hooks/useNip04Tools";
import { CopyIconButton } from "./CopyIconButton";

export default function RewardModal({
  game,
  onClose,
  ...props
}: { game: Game } & Omit<ModalProps, "children">) {
  const auth = useAuth();
  const toast = useToast();
  const { decrypt } = useNip04Tools();
  const [tokens, setTokens] = useState<string[]>();
  const [loading, setLoading] = useState(false);

  const reward = game.finish?.rewards[auth.pubkey];

  const showTokens = async () => {
    if (!game.finish || !reward) return;

    setLoading(true);
    try {
      const decrypted = await decrypt(game.finish.author, reward);
      const tokens = JSON.parse(decrypted) as string[];
      setTokens(tokens);
    } catch (e) {
      if (e instanceof Error)
        toast({ status: "error", description: e.message });
    }
    setLoading(false);
  };

  let content = <Text>Nothing to claim ¯\_(ツ)_/¯</Text>;
  if (tokens && tokens.length > 0) {
    content = (
      <Flex direction="column" gap="4">
        {tokens.map((token) => (
          <Flex gap="2" key={token}>
            <Input value={token} readOnly />
            <CopyIconButton
              text={token}
              aria-label="copy token"
              variant="outline"
              colorScheme="purple"
            />
          </Flex>
        ))}
        <Text>You can use one of these wallets to redeem tokens:</Text>
        <Button
          as={Link}
          target="_blank"
          href="https://wallet.cashu.me"
          isExternal
          variant="outline"
          colorScheme="purple"
        >
          wallet.cashu.me
        </Button>
        <Button
          as={Link}
          target="_blank"
          href="https://wallet.nutstash.app"
          isExternal
          variant="outline"
          colorScheme="purple"
        >
          wallet.nutstash.app
        </Button>
        <Text>Or withdraw to a lightning wallet</Text>
        <Button
          as={Link}
          target="_blank"
          href="https://redeem.cashu.me/"
          isExternal
          variant="outline"
          colorScheme="yellow"
        >
          redeem.cashu.me
        </Button>
      </Flex>
    );
  } else if (reward && !tokens) {
    content = (
      <Button
        colorScheme="purple"
        onClick={showTokens}
        isLoading={loading}
        w="full"
      >
        Show tokens
      </Button>
    );
  }

  return (
    <Modal onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Claim reward</ModalHeader>
        <ModalCloseButton />
        <ModalBody mb="4" mt="0">
          {content}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
