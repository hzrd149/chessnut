import {
  Box,
  Card,
  CardBody,
  Flex,
  Input,
  Link,
  LinkBox,
  LinkOverlay,
  Spinner,
} from "@chakra-ui/react";
import QrCodeSvg from "./QrCodeSvg";
import { CopyIconButton } from "./CopyIconButton";

export function InvoiceCard({ invoice }: { invoice: string }) {
  return (
    <Card size="sm" variant="outline">
      <CardBody display="flex" flexDirection="column">
        <LinkBox maxW="4in">
          <QrCodeSvg content={invoice} />
          <LinkOverlay href={`lightning:${invoice}`} />
        </LinkBox>
        <Flex gap="2" w="100%">
          <Input readOnly value={invoice} />
          <CopyIconButton text={invoice} aria-label="Copy invoice" />
        </Flex>
      </CardBody>
    </Card>
  );
}
