# ChessNuts

A [nostr](https://github.com/nostr-protocol/nostr) based chess game that uses [cachu](https://github.com/cashubtc) to place bets

## Nostr Events

```mermaid
erDiagram
    METADATA {
        string name
        string picture
    }
    PLAYER {
        string pubkey
    }
    PLAYER ||--|| METADATA : pubkey

    MODERATOR {
        string pubkey
        string[] relay-list "10002 relay list"
        string[] games "keep track of active games"
    }
    MODERATOR ||--o{ GAME : games
    MODERATOR ||--|| METADATA : pubkey

    GAME {
        string id "event id"
        int kind "2500"
        string content "public message?"
        string author "player starting game"
        string target "[p, target, r, 'target']"
        string moderator "[p, moderator, r, 'moderator']"
        string fen "[fen, state] starting state"
    }
    GAME ||--|| PLAYER : author
    GAME ||--|| PLAYER : target
    GAME ||--|| MODERATOR : moderator

    PLACE-BET {
        string id "event id"
        string author "player placing the bet"
        int kind "25003 (Ephemeral Event)"
        string game "[e, game, r, 'game']"
        string moderator "[p, moderator, r, 'moderator']"
        string cashuToken "[cashu, tokens] encrypted for moderator"
    }
    PLACE-BET ||--|| PLAYER : author
    PLACE-BET ||--|| GAME : game
    PLACE-BET ||--|| MODERATOR : moderator

    BET {
        string id "event id"
        int kind "2502"
        string author "moderator"
        string player "[p, player] player who placed the bet"
        int amount "[value, int] value in sats"
        string game "[e, game, r, 'game']"
        string proofs "[cashuProofs, tokens] tokens with only proofs (NUT-07)"
    }
    BET ||--|| MODERATOR : author
    BET ||--|| PLAYER : player
    BET ||--|| GAME : game

    MOVE {
        string id "event id"
        int kind "2501"
        string author "player making the move"
        string move "[move, move] chess move"
        string fen "[fen, state] new state"
        string game "[e, game, r, 'game']"
        string previous "[e, previous, r, 'previous'] (optional)"
    }
    MOVE ||--|| PLAYER : author
    MOVE ||--|| GAME : game
    MOVE ||--o| MOVE : previous

    FORFEIT {
        string id "event id"
        int kind "2504"
        string author "player forfeiting"
        string game "[e, game, r, 'game']"
        string moderator "[p, moderator, r, 'moderator']"
    }
    FORFEIT ||--|| PLAYER : author
    FORFEIT ||--|| GAME : game
    FORFEIT ||--|| MODERATOR : moderator

    FINISH {
        string id "event id"
        int kind "2505"
        string author "moderator"
        string content "human readable message"
        string game "[e, game, r, 'game']"
        string previous "[e, previous, r, 'move'] (optional)"
        string fen "[fen, state] ending state"
        string winner "[p, winner, r, 'winner']"
        string looser "[p, looser, r, 'looser']"
        string winnings "[winnings, int] amount awarded in sats"
        string reward "[cashu, token] (encrypted for winner)"
    }
    FINISH ||--|| MODERATOR : author
    FINISH ||--|| PLAYER : winner
    FINISH ||--|| PLAYER : looser
    FINISH ||--|| MOVE : previous
    FINISH ||--|| GAME : game
```

## Game Flow

```mermaid
flowchart TD
    subgraph Player A
    afindPlayer[Find player B]-->aCreateGame[Create game]

    aCreateGame-->aPlaceBet[Place bet]
    aPlaceBet--> aWaitForBet([Wait for B bet])
    aWaitForBet --> aWaitForTurn([Wait for turn])
    aWaitForTurn --> aGameMove[Game Move]
    aWaitForTurn-->aForfeit[Forfeit]
    aPlaceBet-->aWatchTokens([Watch for tokens])
    aWatchTokens-->aClaimTokens[Claim tokens]
    end

    subgraph Moderator Bot
    modFindGame([Find game]) --> modWatchForBets([Watch for bets])
    modWatchForBets-->modConsumeToken[Consume tokens]
    modConsumeToken-->modPostBet[Post Bet]
    modFindGame --> modWatchMove([Watch moves])
    modFindGame --> modWatchForfeit([Watch Forfeit])
    modWatchMove-- checkmate? -->modSendTokens[Send Tokens to winner]
    modWatchForfeit-->modSendTokens
    end

    subgraph Blayer B
    bLookForGames([Find game]) --> bWaitForBet([Wait for bet])
    bWaitForBet --> bPlaceBet[Place bet]
    bPlaceBet --> bFirstMove[First move]
    bFirstMove -.-> aWaitForTurn
    bFirstMove --> bWaitForTurn([Wait for turn])
    bFirstMove-->bWatchTokens([Watch for tokens])
    bWaitForTurn --> bGameMove[Game Move]
    bWaitForTurn-->bForfeit[Forfeit]
    bWatchTokens-->bClaimTokens[Claim tokens]
    end

    aPlaceBet-.->modWatchForBets
    bPlaceBet-.->modWatchForBets
    modPostBet-.->bWaitForBet
    modPostBet-.->aWaitForBet
    aCreateGame-.->bLookForGames
    aCreateGame-.->modFindGame
    aGameMove-.->bWaitForTurn
    bGameMove-.->aWaitForTurn
    aGameMove-.->modWatchMove
    bGameMove-.->modWatchMove
    aForfeit-.->modWatchForfeit
    bForfeit-.->modWatchForfeit
    modSendTokens-.->aWatchTokens
    modSendTokens-.->bWatchTokens
```
