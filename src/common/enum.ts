export enum GameTypes {
  Chess = "chess",
  TicTacToe = "tictactoe",
}

export enum GameEventKinds {
  Game = 2500,
  State = 2501,
  PlaceBet = 25002,
  Bet = 2502,
  Finish = 2503,
}

export enum GameFinishReasons {
  Win = "win",
  Draw = "draw",
}
