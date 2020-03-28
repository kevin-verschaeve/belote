export const suits = ["spades", "diamonds", "clubs", "hearts"];
const values = ["A", "7", "8", "9", "10", "J", "Q", "K"];

const buildDeck = () => {
  const deck = [];
  let i = 0;

  for (i; i < suits.length; i++) {
    for (let x = 0; x < values.length; x++) {
      deck.push({value: values[x], suit: suits[i]});
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

export function getOneCard(deck) {
  return deck.pop();
}
