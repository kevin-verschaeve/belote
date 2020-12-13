import { findBestCard, betterAtouts } from './PliManager.js';

export default (game, players, player, card, me) => {
    const playerCanPlay = player.hasCancelledACard || (me == game.currentPlayer && !game.toPick);

    // not player turn and player did not cancel a card
    if (!playerCanPlay) {
        return false;
    }

    // first card to play, allow everything
    if (0 === game.board.length) {
        return true;
    }

    const suit = game.board[0].suit;
    const bestCard = findBestCard(JSON.parse(JSON.stringify(game.board)), game.atout);

    // the card is on the same suit of the asked suit (first card played)
    if (suit === card.suit) {
        if (game.atout == suit) {
            const atoutsUp = betterAtouts(bestCard, JSON.parse(JSON.stringify(player.cards)), game.atout);
            if (0 == atoutsUp.length) {
                return true;
            }

            return atoutsUp.findIndex((c) => c.suitOrder == card.suitOrder && c.text == card.text) > -1;
        }

        return true;
    }

    // this card is not of asked suit, but player have some
    const playerHasSuitCards = player.cards.filter((c) => c.suit == suit).length > 0;
    if (playerHasSuitCards) {
        return false;
    }

    // this card is an atout
    if (card.suit == game.atout) {
        // best card is not an atout
        if (bestCard.suit !== game.atout) {
            return true;
        }

        // someone has cut first
        const atoutsUp = betterAtouts(bestCard, JSON.parse(JSON.stringify(player.cards)), game.atout);
        if (0 == atoutsUp.length) { // not a better atout, but still atout
            return true;
        }

        return atoutsUp.findIndex((c) => c.suitOrder == card.suitOrder && c.text == card.text) > -1;
    }

    const playerHasAtouts = player.cards.filter((c) => c.suit == game.atout).length > 0;
    if (!playerHasAtouts) {
        return true;
    }

    const mate = players.find((p) => p.team == player.team && p.name != player.name).name;

    // piss
    if(bestCard.player == mate) {
        return true
    }

    return false;
};