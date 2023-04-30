import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalProps,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  ButtonGroup,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { getWallet } from "../../common/services/cashu";
import { InvoiceCard } from "./InvoiceCard";
import { Proof, getEncodedToken } from "@cashu/cashu-ts";
import { useNip04Tools } from "../hooks/useNip04Tools";
import { useSigner } from "../hooks/useSigner";
import { ensureConnected, getRelay } from "../../common/services/relays";
import { DEFAULT_MINT } from "../const";
import Game from "../../common/classes/game";

type MintRequest = {
  amount: number;
  invoice: string;
  hash: string;
};

export default function PlaceBetModal({
  game,
  onClose,
  ...props
}: { game: Game } & Omit<ModalProps, "children">) {
  const [mintRequest, setMintRequest] = useState<MintRequest>();
  const [amount, setAmount] = useState("2");
  const [checkingTokens, setCheckingTokens] = useState(false);
  const [waitingFormMod, setWaitingForMod] = useState(false);
  const { encrypt } = useNip04Tools();
  const signer = useSigner();
  const toast = useToast();

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();

    const wallet = await getWallet(DEFAULT_MINT);
    const intAmount = parseInt(amount);
    if (!Number.isInteger(intAmount)) throw new Error("Failed to parse amount");
    const request = await wallet.requestMint(intAmount);
    setMintRequest({
      amount: intAmount,
      invoice: request.pr,
      hash: request.hash,
    });
  };

  const checkTokens = async () => {
    if (!mintRequest) return;

    try {
      setCheckingTokens(true);

      const wallet = await getWallet(DEFAULT_MINT);
      const proofs = await wallet.requestTokens(
        mintRequest.amount,
        mintRequest.hash
      );

      setCheckingTokens(false);
      setWaitingForMod(true);

      const token = getEncodedToken({
        token: [{ mint: wallet.mint.mintUrl, proofs }],
      });
      const encryptedTokens = await encrypt(game.moderator, token);
      const placeBetDraft = game.createPlaceBetEvent(encryptedTokens);
      const event = await signer(placeBetDraft);
      const relay = getRelay(game.relay);
      await ensureConnected(relay);
      const pub = relay.publish(event);

      pub.on("ok", () => {
        toast({ status: "success", description: "sent bet" });
      });
      pub.on("failed", () => {
        toast({ status: "error", description: "failed to send bet" });
      });

      setTimeout(() => {
        // timeout, reclaim tokens
      }, 1000 * 30);
    } catch (e) {
      if (e instanceof Error) {
        toast({ status: "error", description: e.message });
        console.log(e);
      }
    }
    setCheckingTokens(false);
    setWaitingForMod(false);
  };

  let content = <Spinner />;

  if (mintRequest) {
    content = (
      <>
        <InvoiceCard invoice={mintRequest.invoice} />
        <Button
          variant="outline"
          colorScheme="purple"
          w="full"
          mt="4"
          onClick={checkTokens}
          isLoading={checkingTokens}
        >
          Check Paid
        </Button>
      </>
    );
  } else {
    content = (
      <form onSubmit={handleSubmit}>
        <FormControl>
          <FormLabel>Amount</FormLabel>
          <NumberInput value={amount} onChange={(e) => setAmount(e)}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <ButtonGroup size="sm" mt="2">
            <Button onClick={() => setAmount("21")}>21</Button>
            <Button onClick={() => setAmount("210")}>210</Button>
            <Button onClick={() => setAmount("2100")}>2.1K</Button>
            <Button onClick={() => setAmount("21000")}>21K</Button>
          </ButtonGroup>
        </FormControl>
        <Button type="submit" colorScheme="purple" w="full" mt="4">
          Create Invoice
        </Button>
      </form>
    );
  }

  return (
    <Modal onClose={onClose} closeOnOverlayClick={false} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Place Bet</ModalHeader>
        <ModalCloseButton />
        <ModalBody mt="0" mb="4">
          {content}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
