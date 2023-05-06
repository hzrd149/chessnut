import {
  Alert,
  AlertIcon,
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
} from "@chakra-ui/react";
import { useAuth } from "../AuthProvider";
import QrCodeSvg from "./QrCodeSvg";
import useUserMetadata from "../hooks/useUserMetadata";
import { useEffect, useState } from "react";
import { CopyIconButton } from "./CopyIconButton";
import Username from "./Username";

export default function ProfileModal({
  isOpen,
  onClose,
  ...props
}: Omit<ModalProps, "children">) {
  const auth = useAuth();

  const [displayName, setDisplayName] = useState("anon");

  const metadata = useUserMetadata(auth.pubkey);
  useEffect(() => {
    if (!metadata) return;
    if (metadata.display_name) setDisplayName(metadata.display_name);
  }, [metadata]);

  return (
    <Modal
      blockScrollOnMount={false}
      isOpen={isOpen}
      onClose={onClose}
      {...props}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader p="4">Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody px="4" pt="0" pb="4">
          {window.nostr && !auth.nip07 && (
            <Button
              colorScheme="purple"
              onClick={() => auth.loginWithNip07()}
              w="full"
            >
              Login with NIP-07
            </Button>
          )}
          {auth.nip07 && (
            <Alert status="success" whiteSpace="pre">
              <AlertIcon />
              <span>Logged in as </span>
              <Username pubkey={auth.pubkey} />
            </Alert>
          )}
          {/* <FormControl my="2">
            <FormLabel>Username</FormLabel>
            <Input
              placeholder="Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              readOnly
            />
          </FormControl> */}

          <Heading my="2" size="lg">
            Pubkey
          </Heading>
          <QrCodeSvg content={auth.pubkey} border={1} />
          <Flex mt="2">
            <Input value={auth.pubkey} readOnly mr="2" />
            <CopyIconButton text={auth.pubkey} aria-label="Copy pubkey" />
          </Flex>
          <Flex justifyContent="center">
            <Button mt="4" w="2xs" onClick={onClose}>
              Close
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
