import { useAsync } from "react-use";
import { getUserMetadata } from "../services/user-metadata";

export default function useUserMetadata(pubkey: string) {
  const { value: metadata } = useAsync(() => getUserMetadata(pubkey), [pubkey]);

  return metadata;
}
