import {
  Card,
  CardBody,
  Flex,
  Input,
  LinkBox,
  LinkOverlay,
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
        <Flex gap="2" w="100%" mt="2">
          <Input readOnly value={invoice} />
          <CopyIconButton text={invoice} aria-label="Copy invoice" />
        </Flex>
      </CardBody>
    </Card>
  );
}
