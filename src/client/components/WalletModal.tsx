import {
  Button,
  Flex,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../AuthProvider";
import { useCallback, useMemo, useState } from "react";
import { CopyIconButton } from "./CopyIconButton";
import { addToken, getTokens, onChange, saveTokens } from "../services/wallet";
import useSignal from "../hooks/useSignal";
import { getTokenTotal } from "../../common/helpers/cashu";
import { getDecodedToken, getEncodedToken } from "@cashu/cashu-ts";
import { getWallet } from "../../common/services/cashu";
import type { Token } from "@cashu/cashu-ts/dist/lib/es5/model/types";
import { useSigner } from "../hooks/useSigner";
import { useNip04Tools } from "../hooks/useNip04Tools";

export default function WalletModal({
  isOpen,
  onClose,
  ...props
}: Omit<ModalProps, "children">) {
  const toast = useToast();
  const tokens = getTokens();
  useSignal(onChange);

  const auth = useAuth();
  const signer = useSigner();
  const { encrypt } = useNip04Tools();

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);
  const receiveTokens = useCallback(async () => {
    setLoading(true);
    try {
      const parsed = getDecodedToken(input);
      if (parsed.token.length > 1)
        throw new Error("cant handle tokens with multiple mints");
      const mintUrl = parsed.token[0].mint;

      const wallet = await getWallet(mintUrl);
      const { proofs } = await wallet.receive(input);
      if (proofs.length === 0) throw new Error("no proofs");
      const token: Token = { token: [{ mint: mintUrl, proofs }] };
      addToken(token);
      await saveTokens(signer, (text: string) => encrypt(auth.pubkey, text));
    } catch (e) {
      if (e instanceof Error) {
        toast({ status: "error", description: e.message });
      }
    }
    setLoading(false);
  }, [input]);

  const total = tokens.reduce((v, token) => v + getTokenTotal(token), 0);
  const encodedTokens = useMemo(() => {
    return tokens.map((token) => ({ token, encoded: getEncodedToken(token) }));
  }, [tokens]);

  return (
    <Modal
      blockScrollOnMount={false}
      isOpen={isOpen}
      onClose={onClose}
      {...props}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader p="4">Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody px="4" pt="0" pb="4">
          <Stat>
            <StatLabel>Total</StatLabel>
            <StatNumber>{total}</StatNumber>
            <StatHelpText>{tokens.length} tokens</StatHelpText>
          </Stat>
          <Textarea
            value={input}
            placeholder="cashuA..."
            onChange={(e) => setInput(e.target.value)}
          />
          <Flex mt="2" justifyContent="space-between">
            <Button onClick={() => setInput("")}>Reset</Button>
            <Button
              colorScheme="purple"
              onClick={receiveTokens}
              isLoading={loading}
            >
              Add tokens
            </Button>
          </Flex>
          <Heading size="md" my="2">
            Tokens
          </Heading>
          <Flex direction="column" gap="2" alignItems="center">
            {encodedTokens.map(({ token, encoded }) => (
              <Flex key={encoded} gap="2">
                <Input
                  type="number"
                  value={getTokenTotal(token)}
                  readOnly
                  flex={1}
                />
                <Input value={encoded} readOnly flex={2} />
                <CopyIconButton text={encoded} aria-label="copy token" />
              </Flex>
            ))}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
