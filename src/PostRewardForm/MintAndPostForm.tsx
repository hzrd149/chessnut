import { useState } from "react";
import QrCodeSvg from "../components/QrCodeSvg";
import { Box, Button, Flex, Heading, Spinner, Stack } from "@chakra-ui/react";
import { getWallet } from "../services/cashu";
import { LightningIcon } from "../components/Icons";
import { CopyIconButton } from "../components/CopyIconButton";
import { InvoiceCard } from "../components/InvoiceCard";

export default function MintAndPostForm() {
  const [loading, setLoading] = useState("");
  const [invoice, setInvoice] = useState("");
  const [hash, setHash] = useState("");
  const [amountInput, setAmountInput] = useState("");

  if (loading) {
    return (
      <Stack>
        <Heading size="sm">{loading}</Heading>
        <Spinner />
      </Stack>
    );
  }

  if (invoice) {
    return (
      <Box>
        <InvoiceCard invoice={invoice} />
      </Box>
    );
  }

  const requestMint = async (amount: number) => {
    setLoading("Minting tokens");
    const wallet = await getWallet();
    const result = await wallet.requestMint(amount);
    if (result.error) throw new Error(result.error);
    setInvoice(result.pr);
    setHash(result.hash);
    setLoading("");
  };

  return (
    <Flex direction="row" gap="4">
      <Button
        onClick={() => requestMint(100)}
        rightIcon={<LightningIcon color="yellow.400" />}
      >
        10
      </Button>
      <Button
        onClick={() => requestMint(100)}
        rightIcon={<LightningIcon color="yellow.400" />}
      >
        21
      </Button>
      <Button
        onClick={() => requestMint(100)}
        rightIcon={<LightningIcon color="yellow.400" />}
      >
        100
      </Button>
    </Flex>
  );
}
