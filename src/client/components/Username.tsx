import useUserMetadata from "../hooks/useUserMetadata";

export default function Username({ pubkey }: { pubkey: string }) {
  const metadata = useUserMetadata(pubkey);

  return <span>{metadata?.display_name ?? metadata?.name ?? pubkey}</span>;
}
