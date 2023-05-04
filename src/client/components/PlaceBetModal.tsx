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
  Heading,
  Flex,
  Select,
} from "@chakra-ui/react";
import { useState } from "react";
import { getWallet } from "../../common/services/cashu";
import { InvoiceCard } from "./InvoiceCard";
import { getEncodedToken } from "@cashu/cashu-ts";
import { useNip04Tools } from "../hooks/useNip04Tools";
import { useSigner } from "../hooks/useSigner";
import {
  ensureConnected,
  getRelay,
  waitForPub,
} from "../../common/services/relays";
import Game from "../../common/classes/game";
import { buildPlaceBetEvent } from "../helpers/events";
import { CheckInCircle } from "./Icons";

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
  const [mintUrl, setMintUrl] = useState("https://8333.space:3338");
  const [amount, setAmount] = useState("2");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { encrypt } = useNip04Tools();
  const signer = useSigner();
  const toast = useToast();

  const createInvoice: React.FormEventHandler = async (e) => {
    e.preventDefault();

    setLoading(true);
    const wallet = await getWallet(mintUrl);
    const intAmount = parseInt(amount);
    if (!Number.isInteger(intAmount)) throw new Error("Failed to parse amount");
    const request = await wallet.requestMint(intAmount);
    setMintRequest({
      amount: intAmount,
      invoice: request.pr,
      hash: request.hash,
    });
    setLoading(false);
  };

  const checkTokens = async () => {
    if (!mintRequest) return;

    try {
      setLoading(true);

      const wallet = await getWallet(mintUrl);
      const proofs = await wallet.requestTokens(
        mintRequest.amount,
        mintRequest.hash
      );

      const token = getEncodedToken({
        token: [{ mint: wallet.mint.mintUrl, proofs }],
      });
      const encryptedTokens = await encrypt(game.moderator, token);
      const placeBetDraft = buildPlaceBetEvent(game, encryptedTokens);
      const event = await signer(placeBetDraft);
      const relay = getRelay(game.relay);
      await ensureConnected(relay);
      const pub = relay.publish(event);
      await waitForPub(pub);

      const timeout = window.setTimeout(() => {
        game.onBet.off(listener);
        // timeout, reclaim tokens
        toast({ status: "error", description: "Failed to post bet" });
      }, 1000 * 30);

      let listener = () => {
        toast({ status: "success", description: "sent bet" });
        setSuccess(true);
        game.onBet.off(listener);
        window.clearTimeout(timeout);
      };

      game.onBet.on(listener);
    } catch (e) {
      if (e instanceof Error) {
        toast({ status: "error", description: e.message });
        console.log(e);
      }
    }
    setLoading(false);
  };

  let content = <Spinner />;

  if (success) {
    content = (
      <Flex
        alignItems="center"
        justifyContent="center"
        direction="column"
        minH="sm"
        gap="4"
      >
        <CheckInCircle fontSize="64" color="green" />
        <Heading size="md">Placed bet</Heading>
        <Button onClick={onClose}>Close</Button>
      </Flex>
    );
  } else if (mintRequest) {
    content = (
      <>
        <InvoiceCard invoice={mintRequest.invoice} />
        <Button
          variant="outline"
          colorScheme="purple"
          w="full"
          mt="4"
          onClick={checkTokens}
          isLoading={loading}
        >
          Check Paid
        </Button>
      </>
    );
  } else {
    content = (
      <form onSubmit={createInvoice}>
        <FormControl isRequired>
          <FormLabel>Mint</FormLabel>
          <Select
            placeholder="Select mint"
            isRequired
            value={mintUrl}
            onChange={(e) => setMintUrl(e.target.value)}
          >
            <option value="https://8333.space:3338">
              https://8333.space:3338
            </option>
            <option value="https://lnbits.semisol.dev/cashu/api/v1/TEUcc6GN4dEsh6wa6J2hSu">
              https://lnbits.semisol.dev/cashu/api/v1/TEUcc6GN4dEsh6wa6J2hSu
            </option>
          </Select>
        </FormControl>
        <FormControl mt="2">
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
        <Button
          type="submit"
          colorScheme="purple"
          w="full"
          mt="4"
          isLoading={loading}
        >
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
