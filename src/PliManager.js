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
