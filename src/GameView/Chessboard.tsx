import { useMemo } from "react";
import { Card, CardBody } from "@chakra-ui/react";
import { ParsedGame } from "../helpers/game-events";
import Chessground from "@react-chess/chessground";
import { Chessground as LichessChessground } from "chessground";
import { useAuth } from "../AuthProvider";

type Config = NonNullable<Parameters<typeof LichessChessground>[1]>;

export default function Chessboard({ game }: { game: ParsedGame }) {
  const auth = useAuth();
  const config = useMemo(() => {
    const config: Config = {
      fen: game.state,
      movable: { showDests: true },
      viewOnly: auth.pubkey !== game.playerA && auth.pubkey !== game.playerB,
    };
    return config;
  }, [game]);

  return (
    <Card>
      <CardBody>
        <Chessground config={config} />
      </CardBody>
    </Card>
  );
}
