export const suits = ["spades", "diamonds", "clubs", "hearts"];

const details = [
  {text: 'A', value: 11, order: 8},
  {text: '10', value: 10, order: 7},
  {text: 'K', value: 4, order: 6},
  {text: 'Q', value: 3, order: 5},
  {text: 'J', value: 2, order: 4},
  {text: '9', value: 0, order: 3},
  {text: '8', value: 0, order: 2},
  {text: '7', value: 0, order: 1},
];

const buildDeck = () => {
  const deck = [];
  let i = 0;

  for (i; i < suits.length; i++) {
    for (let x = 0; x < details.length; x++) {
      deck.push({...details[x], ...{suit: suits[i], suitOrder: i}});
    }
  }

  return deck;
};

const shuffle = (deck) => {
  let location1, location2, tmp, i = 0;
  // for 1000 turns
  // switch the values of two random cards
  for (i; i < 1000; i++) {
    location1 = Math.floor((Math.random() * deck.length));
    location2 = Math.floor((Math.random() * deck.length));
    tmp = deck[location1];

    deck[location1] = deck[location2];
    deck[location2] = tmp;
  }
};

export function getDeck() {
  let deck = buildDeck();
  shuffle(deck);

  return deck;
}

export function cutDeck(deck) {
  const cutPoint = Math.floor(Math.random() * 26) + 3; // number between 3 and 29 (26 + 3)

  return [...deck.slice(cutPoint, deck.length), ...deck.slice(0, cutPoint)];
}

export function getPlayerCards(deck, nb, player) {
  let i = 0;
  const cards = [];
  let deckCard;

  for (i; i < nb; i++) {
    deckCard = deck.pop();
    deckCard.player = player;
    cards.push(deckCard);
  }

  return cards;
}

export function sortCards(cards, atout) {
  return cards.sort((a, b) => {
    let aOrder = a.order;
    let bOrder = b.order;

    if (atout == a.suit) {
      if (a.text == 'J') {
        aOrder = 10;
      }

      if (a.text == '9') {
        aOrder = 9;
      }
    }

    if (atout == b.suit) {
      if (b.text == 'J') {
        bOrder = 10;
      }

      if (b.text == '9') {
        bOrder = 9;
      }
    }

    if (a.suitOrder < b.suitOrder || (a.suit == b.suit && aOrder < bOrder)) {
      return -1;
    }

    return 1;
  });
}

export function getOneCard(deck) {
  return deck.pop();
}
