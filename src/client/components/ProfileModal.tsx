import {
  Alert,
  AlertIcon,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from "@chakra-ui/react";
import { useAuth } from "../AuthProvider";
import QrCodeSvg from "./QrCodeSvg";
import useUserMetadata from "../hooks/useUserMetadata";
import { useEffect, useState } from "react";
import { CopyIconButton } from "./CopyIconButton";

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
              variant="outline"
              onClick={() => auth.loginWithNip07()}
              w="full"
            >
              Login with NIP-07
            </Button>
          )}
          {auth.nip07 && (
            <Alert status="warning">
              <AlertIcon />
              Profile editing is disabled because you are using a browser
              extension
            </Alert>
          )}
          <FormControl my="2">
            <FormLabel>Username</FormLabel>
            <Input
              placeholder="Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              readOnly
            />
          </FormControl>

          <Heading mt="2" size="lg">
            Pubkey
          </Heading>
          <QrCodeSvg content={auth.pubkey} border={1} />
          <Flex>
            <Input value={auth.pubkey} readOnly />
            <CopyIconButton text={auth.pubkey} aria-label="Copy pubkey" />
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
