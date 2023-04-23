import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  Flex,
  Heading,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { RELAY_URL, MODERATOR_PUBKEY } from "../../const";
import { useAuthPubkey } from "../../AuthProvider";
import UserAvatar from "../../components/UserAvatar";
import useUserMetadata from "../../hooks/useUserMetadata";
import { useState } from "react";
import { buildDraftGameEvent } from "../../helpers/game-events";
import { ensureConnected, getRelay } from "../../services/relays";

export default function InviteCard({
  pubkey,
  ...props
}: { pubkey: string } & CardProps) {
  const self = useAuthPubkey();
  const toast = useToast();
  const metadata = useUserMetadata(pubkey);
  const [message, setMessage] = useState("Play a chess game with me");
  const [loading, setLoading] = useState(false);

  const createGame = async () => {
    setLoading(true);
    try {
      const draft = buildDraftGameEvent(
        self,
        pubkey,
        message,
        MODERATOR_PUBKEY
      );
      const signed = await window.nostr?.signEvent(draft);
      if (!signed) throw new Error("failed to sign");
      const relay = getRelay(RELAY_URL);
      await ensureConnected(relay);
      const pub = relay.publish(signed);
      pub.on("ok", () => toast({ status: "success", title: "Created game" }));
      pub.on("failed", () =>
        toast({ status: "error", title: "Failed to create game" })
      );
    } catch (e) {
      if (e instanceof Error) {
        toast({ status: "error", description: e.message });
      }
    }
    setLoading(false);
  };

  return (
    <Card {...props}>
      <CardHeader>
        <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
          <UserAvatar pubkey={pubkey} flexShrink={0} size="md" />

          <Box>
            <Heading size="sm" isTruncated>
              {metadata?.display_name || metadata?.name}
            </Heading>
            <Text>{metadata?.nip05}</Text>
          </Box>
        </Flex>
      </CardHeader>

      <CardBody py="0">
        <Textarea
          placeholder="Public message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </CardBody>

      <CardFooter flexWrap="wrap">
        <Button
          flex="1"
          variant="outline"
          colorScheme="purple"
          onClick={createGame}
          isLoading={loading}
        >
          Create game
        </Button>
      </CardFooter>
    </Card>
  );
}
