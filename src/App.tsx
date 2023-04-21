import { Code, Container, Flex } from "@chakra-ui/react";
import PostRewardForm from "./PostRewardForm";
import { useRelaySub } from "./hooks/useRelaySub";
import { RELAY_URL } from "./const";
import { useSubEvents } from "./hooks/useSubEvents";
import Header from "./components/Header";

export default function App() {
  const sub = useRelaySub("games", RELAY_URL, [{ kinds: [2500], limit: 10 }]);
  const events = useSubEvents(sub);

  return (
    <Container
      size="lg"
      display="flex"
      flexDirection="column"
      height="100%"
      overflow="hidden"
      position="relative"
      padding="0"
    >
      <Header />
      <Flex direction="column" gap="4">
        {events.map((event) => (
          <Code>{JSON.stringify(event)}</Code>
        ))}
      </Flex>
      <PostRewardForm />
    </Container>
  );
}
