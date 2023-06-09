import {
  Avatar,
  AvatarBadge,
  AvatarBadgeProps,
  AvatarProps,
} from "@chakra-ui/react";
import useUserMetadata from "../hooks/useUserMetadata";

export default function UserAvatar({
  pubkey,
  badgeColor,
  ...props
}: { pubkey: string; badgeColor?: AvatarBadgeProps["bg"] } & Omit<
  AvatarProps,
  "name" | "src"
>) {
  const metadata = useUserMetadata(pubkey);

  return (
    <Avatar
      {...props}
      name={metadata?.display_name || metadata?.name}
      src={metadata?.picture}
    >
      {badgeColor && <AvatarBadge boxSize="1.25em" bg={badgeColor} />}
    </Avatar>
  );
}
