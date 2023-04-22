import { Avatar, AvatarProps } from "@chakra-ui/react";
import useUserMetadata from "../hooks/useUserMetadata";

export default function UserAvatar({
  pubkey,
  ...props
}: { pubkey: string } & Omit<AvatarProps, "name" | "src">) {
  const metadata = useUserMetadata(pubkey);

  return (
    <Avatar
      {...props}
      name={metadata?.display_name || metadata?.name}
      src={metadata?.picture}
    />
  );
}
