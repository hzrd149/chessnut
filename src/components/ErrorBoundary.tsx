import { FallbackProps } from "react-error-boundary";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: Partial<FallbackProps>) {
  return (
    <Alert status="error">
      <AlertIcon />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{error?.message}</AlertDescription>
    </Alert>
  );
}
