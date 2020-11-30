export function findPliWinner(pli, atout) {
  const cardsWithAtout = pli.filter((card) => card.suit == atout);

  if (cardsWithAtout.length) {
    pli = cardsWithAtout.map((card) => {
      card.order = {3: 9, 4: 10}[card.order] || card.order;

      return card;
    });
  }

  const bestCard = findBestCard(pli);

  return bestCard.player;
}

function findBestCard(cards) {
  const askedSuit = cards[0].suit;
  const sorted = cards.filter((card) => card.suit == askedSuit).sort((a, b) => a.order > b.order ? -1 : 1);

  return sorted[0];
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

// TODO : gerer les litiges

export function calculateRoundScores(game, players) {
  const takerTeam = players.find((p) => p.name == game.taker).team;
  const scoreNS = game.score.NS + (game.belote == 'NS' ? 20 : 0);
  const scoreEW = game.score.EW + (game.belote == 'EW' ? 20 : 0);

  if (takerTeam == 'NS') {
    // capot from EW team (opponent team), it this happens, please stop playing
    if (game.NS.length == 0) {
      return {NS: (game.belote == 'NS' ? 20 : 0), EW: 252 + (game.belote == 'EW' ? 20 : 0), litige: false};
    }

    // capot from NS team (taker team)
    if (game.NS.length == 8) {
      return {NS: 252 + (game.belote == 'NS' ? 20 : 0), EW: (game.belote == 'EW' ? 20 : 0), litige: false};
    }

    const result = scoreNS - (162 + (game.belote === null ? 0 : 20)) / 2;

    if (result >= 0) {
      return {NS: scoreNS, EW: scoreEW, litige: result == 0};
    }

    return {NS: game.belote == 'NS' ? 20 : 0, EW: 162 + (game.belote == 'EW' ? 20 : 0), litige: false};
  }

  if (takerTeam == 'EW') {
    // capot from NS team (opponent team), it this happens, please stop playing
    if (game.EW.length == 0) {
      return {NS: 252 + (game.belote == 'NS' ? 20 : 0), EW: (game.belote == 'EW' ? 20 : 0), litige: false};
    }

    // capot from EW team (taker team)
    if (game.EW.length == 8) {
      return {NS: game.belote == 'NS' ? 20 : 0, EW: 252 + (game.belote == 'EW' ? 20 : 0), litige: false};
    }

    const result = scoreEW - (162 + (game.belote === null ? 0 : 20)) / 2;

    if (result >= 0) {
      return {NS: scoreNS, EW: scoreEW, litige: result == 0};
    }

    return {NS: 162 + (game.belote == 'NS' ? 20 : 0), EW: game.belote == 'EW' ? 20 : 0, litige: false};
  }
}
