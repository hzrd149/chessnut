import { useAuth } from "../../AuthProvider";
import useSignal from "../../hooks/useSignal";
import TicTacToeGame from "../../../common/classes/tic-tac-toe-game";
import { AspectRatio, Box, Grid, GridItem } from "@chakra-ui/react";

export type TicTacToeBoardProps = {
  game: TicTacToeGame;
  onMove?: (move: string) => void;
};

export default function TicTacToeBoard({ game, onMove }: TicTacToeBoardProps) {
  const auth = useAuth();

  useSignal(game.onLoad);
  useSignal(game.onState);

  const isSpectator =
    auth.pubkey !== game.playerA && auth.pubkey !== game.playerB;

  const lastMove = game.getLastMove();

  // return (
  //   <Grid
  //     templateRows="repeat(3, 1fr)"
  //     templateColumns="repeat(3, 1fr)"
  //     gap="2"
  //   >
  //     {game.tictactoe.state
  //       .slice(0, -1)
  //       .split("")
  //       .map((cell, i) => (
  //         <GridItem key={i} rowSpan={1} colSpan={1} bg="tomato">
  //           {cell}
  //         </GridItem>
  //       ))}
  //   </Grid>
  // );
  return (
    <Grid
      templateAreas={`"header header"
                  "nav main"
                  "nav footer"`}
      gridTemplateRows={"50px 1fr 30px"}
      gridTemplateColumns={"150px 1fr"}
      h="200px"
      gap="1"
      color="blackAlpha.700"
      fontWeight="bold"
    >
      <GridItem pl="2" bg="orange.300" area={"header"}>
        Header
      </GridItem>
      <GridItem pl="2" bg="pink.300" area={"nav"}>
        Nav
      </GridItem>
      <GridItem pl="2" bg="green.300" area={"main"}>
        Main
      </GridItem>
      <GridItem pl="2" bg="blue.300" area={"footer"}>
        Footer
      </GridItem>
    </Grid>
  );
}
