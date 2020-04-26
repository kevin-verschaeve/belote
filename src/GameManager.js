import { getDeck, getPlayerCards } from "./DeckManager";

export function createGame(started = false, deck = null) {
  if (null === deck) {
    deck = getDeck();
  }

  return {
    deck: deck,
    takeableCard: null,
    board: [],
    NS: [],
    EW: [],
    started: started,
    dealComplete: false,
    taker: null,
    nbPlis: 0,
    atout: null,
    lastPli: null,
    currentPlayer: null,
    dealer: null,
  };
}

export function dealPreGame(players, deck = null) {
    if (null === deck) {
      deck = getDeck();
    }

    const playersCards = {1: [], 2: [], 3: [], 4: []};

    for (let i in players) {
      playersCards[i] = getPlayerCards(deck, 3, players[i].name);
    }

    for (let i in players) {
      playersCards[i].push(...getPlayerCards(deck, 2, players[i].name));
      players[i].ref.update({cards: playersCards[i]});
    }

    return deck;
}
