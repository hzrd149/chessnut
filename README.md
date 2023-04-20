# ChessNuts

A [nostr](https://github.com/nostr-protocol/nostr) based chess game that uses [cachu](https://github.com/cashubtc) to place bets

## Nostr Events

```mermaid
erDiagram
    METADATA {
        string name
        string picture
        string lud16
    }
    USER {
        string pubkey
    }
    USER ||--|| METADATA : "kind 0 event"

    RELAY-LIST {
        int kind "10002"
        string[] relays
    }

    MODERATOR {
        string pubkey
        string[] activeGames
    }
    MODERATOR ||--|| RELAY-LIST : "mods post relay list"
    MODERATOR ||--o{ GAME : "activeGames"
    MODERATOR ||--|| METADATA : "bot account?"

    PLACE-BET {
        string author
        int kind "25003 Ephemeral Event"
        int amount "redundant?"
        string gameId
        string modPubkey "p tag"
        string cachuToken "minted tokens"
    }
    PLACE-BET ||--|| USER : "author"
    PLACE-BET ||--|| GAME : "[e, gameId]"
    PLACE-BET ||--|| MODERATOR : "[p, modPubkey]"

    BET {
        string id "event id"
        int kind "2502"
        string author "moderator"
        string player "the player placing the bet"
        int amount "value in sats"
        string gameId "ref to game start event"
        string partialCachuToken "NUT-07"
    }
    BET ||--|| MODERATOR : "author"
    BET ||--|| USER : "[p, player]"
    BET ||--|| GAME : "[e, gameId]"

    GAME {
        string id "event id"
        int kind "2500"
        string playerA "first p tag"
        string playerB "second p tag"
        string modPubkey "third p tag"
        string fen "starting state"
    }
    GAME ||--|| USER : "[p, playerA]"
    GAME ||--|| USER : "[p, playerB]"
    GAME ||--|| MODERATOR : "[p, modPubkey]"

    STATE {
        string id "event id"
        int kind "2501"
        string fen "chess state"
        string previusState
        string gameId "ref to game start event"
    }
    STATE ||--|| GAME : "[e, gameId]"
    STATE ||--o| STATE : "[e, previusState]"
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
