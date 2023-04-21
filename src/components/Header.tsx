import { Button, Flex, Heading } from "@chakra-ui/react";

export default function Header() {
  return (
    <Flex p="2" alignItems="center">
      <Heading size="lg">ChessNut</Heading>
      <Button ml="auto" colorScheme="brand">
        Login
      </Button>
    </Flex>
  );
}
