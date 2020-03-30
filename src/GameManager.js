import { getDeck, getPlayerCards } from "./DeckManager";

export function createGame(started = false, scoreNS = 0, scoreEW = 0) {
  const deck = getDeck();

  return {
    deck: deck,
    board: [],
    NS: [],
    EW: [],
    scoreNS: scoreNS,
    scoreEW: scoreEW,
    roundScoreNS: 0,
    roundScoreEW: 0,
    finished: false,
    started: started,
    dealComplete: false,
    teamsReady: false,
    taker: null,
    nbPlis: 0,
    atout: null,
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

export function countPointsInPli(pli, atout, der = false) {
  let total = 0;

  for (let card of pli) {
    if (atout == card.suit) {
      if (card.text == 'J') {
        total += 20;
        continue;
      }

      if (card.text == '9') {
        total += 14;
        continue;
      }
    }

    total += card.value;
  }

  return total + (der ? 10 : 0);
}

export function findTakerTeam(game, players) {
  console.log(game.taker);
  for (let player of players) {
    if (player.name == game.taker) {
      return player.team;
    }
  }

  throw new Error('Player team invalid.');
}

export function calculateRoundScores(game, players) {
  const takerTeam = findTakerTeam(game, players);

  if (takerTeam == 'NS') {
    if (game.NS.length == 8) {
      return {scoreNS: 252, scoreEW: 0};
    }

    if (game.roundScoreNS >= 81) {
      return {scoreNS: game.roundScoreNS, scoreEW: game.roundScoreEW};
    }

    return {scoreNS: 0, scoreEW: 162};
  }

  if (takerTeam == 'EW') {
    if (game.EW.length == 8) {
      return {scoreNS: 0, scoreEW: 252};
    }

    if (game.roundScoreEW >= 81) {
      return {scoreNS: game.roundScoreNS, scoreEW: game.roundScoreEW};
    }

    return {scoreNS: 162, scoreEW: 0};
  }
}
