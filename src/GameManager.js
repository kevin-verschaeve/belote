import { getDeck, getPlayerCards } from "./DeckManager";
import { getContext } from 'svelte';

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

export function dealPreGame(players, dealer, deck = null) {
  const batch = getContext('firebase').firestore().batch();

  if (null === deck) {
    deck = getDeck();
  }

  const playersFromDealer = reorderPlayersFromDealer(players, dealer);
  const cards = {0: [], 1: [], 2: [], 3:[]};

  for (let i in playersFromDealer) {
    cards[i] = getPlayerCards(deck, 3, playersFromDealer[i].name);
  }

  for (let i in playersFromDealer) {
    cards[i].push(...getPlayerCards(deck, 2, playersFromDealer[i].name));
    batch.update(playersFromDealer[i].ref, {cards: cards[i]});
  }

  batch.commit();

  return deck;
}

function reorderPlayersFromDealer(players, dealer) {
  const west = players.find((p) => p.team != dealer.team && p.pos == (dealer.pos + 1 > 3 ? 0 : dealer.pos + 1));

  return [
    west,
    players.find((p) => p.team == dealer.team && p.name != dealer.name),
    players.find((p) => p.team == west.team && p.name != west.name),
    dealer,
  ];
}
