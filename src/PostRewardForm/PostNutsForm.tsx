import { Button, IconButton, Textarea, useToast } from "@chakra-ui/react";
import { SyntheticEvent, useState } from "react";
import { GameEventKinds, MODERATOR_PUBKEY, RELAY_URL } from "../const";
import { EventTemplate } from "nostr-tools";
import dayjs from "dayjs";
import { ensureConnected, getRelay } from "../services/relays";
import { ClipboardIcon } from "../components/Icons";

export default function PostNutsForm() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (!window.nostr) throw new Error("Missing NIP-07 extension");

      const encrypted = await window.nostr.nip04?.encrypt(
        MODERATOR_PUBKEY,
        token
      );
      if (!encrypted) throw new Error("Failed to encrypt token");

      const event: EventTemplate = {
        kind: GameEventKinds.PostReward as number,
        content: encrypted ?? "",
        created_at: dayjs().unix(),
        tags: [["p", MODERATOR_PUBKEY]],
      };
      const signed = await window.nostr.signEvent(event);

      // connect to relay
      const relay = getRelay(RELAY_URL);
      await ensureConnected(relay);

      // send event
      const pub = relay.publish(signed);
      pub.on("ok", () => {
        toast({ status: "success", title: "Posted reward" });
      });
      pub.off("failed", () => {
        toast({ status: "error", title: "Failed to post reward" });
      });
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
    <form onSubmit={handleSubmit}>
      <Textarea
        placeholder="cashuA..."
        value={token}
        onChange={(e) => setToken(e.target.value)}
        isInvalid={
          !!token && /^cashuA[a-zA-Z0-9+\/]+==?$/.test(token) === false
        }
      />

      <IconButton
        icon={<ClipboardIcon />}
        aria-label="Paste from clipboard"
        title="Paste from clipboard"
        onClick={async () => {
          const token = await navigator.clipboard.readText();
          setToken(token);
        }}
      />
      <Button type="submit" isLoading={loading}>
        Send
      </Button>
    </form>
  );
}
