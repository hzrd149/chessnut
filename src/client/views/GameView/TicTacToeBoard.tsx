import { useAuth } from "../../AuthProvider";
import useSignal from "../../hooks/useSignal";
import TicTacToeGame from "../../../common/classes/tic-tac-toe-game";
import { Grid, IconButton } from "@chakra-ui/react";
import { OIcon, XIcon } from "../../components/Icons";

export type TicTacToeBoardProps = {
  game: TicTacToeGame;
  onMove?: (move: string) => void;
};

const indexToCords = (i: number) => {
  const y = Math.floor(i / 3);
  const x = i - y * 3;
  return "" + x + y;
};

export default function TicTacToeBoard({ game, onMove }: TicTacToeBoardProps) {
  const auth = useAuth();

  useSignal(game.onLoad);
  useSignal(game.onState);

  const isPlayer = game.isPlayer(auth.pubkey);

  const lastMove = game.getLastMove();
  const moves = game.tictactoe.moves();

  const isClickable = (i: number) => {
    if (!isPlayer || game.isOver) return false;
    const symbol = game.getPlayerSymbol(auth.pubkey);
    const move = indexToCords(i) + symbol;
    return moves.includes(move);
  };

  const handleCellClick = (i: number) => {
    if (!isPlayer) return;
    const symbol = game.getPlayerSymbol(auth.pubkey);
    const move = indexToCords(i) + symbol;

    if (moves.includes(move) && onMove) {
      onMove(move);
    }
  };

  return (
    <Grid
      templateRows="repeat(3, 1fr)"
      templateColumns="repeat(3, 1fr)"
      gap="2"
      aspectRatio="1"
    >
      {game.tictactoe.state
        .slice(0, -1)
        .split("")
        .map((cell, i) => (
          <IconButton
            key={i}
            h="full"
            icon={
              cell === "X" ? <XIcon /> : cell === "O" ? <OIcon /> : undefined
            }
            fontSize="6rem"
            borderWidth={1}
            isDisabled={!isClickable(i)}
            onClick={() => handleCellClick(i)}
            colorScheme={lastMove?.includes(indexToCords(i)) ? "blue" : "gray"}
            aria-label="Cell"
          />
        ))}
    </Grid>
  );
}
