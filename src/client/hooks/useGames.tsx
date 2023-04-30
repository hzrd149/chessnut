import { useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { listGames, loadGames, onGamesChange } from "../services/games";
import useSignal from "./useSignal";

export default function useGames() {
  const { pubkey } = useAuth();
  useSignal(onGamesChange);
  useEffect(() => loadGames(pubkey), [pubkey]);

  return listGames();
}
