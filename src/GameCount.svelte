<script>
    import { getContext } from 'svelte';
    import { createGame, dealPreGame } from './GameManager.js';
    import { getOneCard, cutDeck } from './DeckManager.js';
    import { calculateRoundScores } from './PliManager.js';
    import TeamScore from './TeamScore.svelte';

    export let game;
    export let gameRef;
    export let players;

    const db = getContext('firebase').firestore();

    const scores = calculateRoundScores(game, players);

    let shuffle = false;

    const next = () => {
        let deck = null;
        if (!shuffle) {
            deck = [];
            [...game.NS, ...game.EW].map((pli) => deck.push(...JSON.parse(pli)));
            deck = cutDeck(deck);
        }

        const newGame = createGame(true, deck);
        const dealer = players.find((p) => p.name == game.dealer);
        const newDealer = players.find((p) => p.pos == (dealer.pos + 1 > 3 ? 0 : dealer.pos + 1));

        newGame.deck = dealPreGame(players, newDealer, newGame.deck);
        newGame.takeableCard = getOneCard(newGame.deck);
        newGame.dealer = newDealer.name;
        newGame.currentPlayer = players.find((p) => p.pos == (newDealer.pos + 1 > 3 ? 0 : newDealer.pos + 1)).name;

        gameRef.set(newGame);
    };
</script>

<h2 class="center-align text">Score</h2>
<div>
    <label>
        <input type="checkbox" bind:value={shuffle} class="filled-in">
        <span class="text">Mélanger ?</span>
    </label>
    <br>
    <button on:click={next} class="btn btn-block btn-large waves-effect waves-light">Manche suivante</button>

    <div id="final-score">
        <TeamScore plis={game.NS} players={players.filter((p) => p.team == 'NS')} points={game.score.NS} realPoints={scores.NS} />
        <div>
            <p class="text">{game.taker}</p>
            <div class="playing-card mini">
                <div class="suit {game.atout}"></div>
            </div>
        </div>
        <TeamScore plis={game.EW} players={players.filter((p) => p.team == 'EW')} points={game.score.EW} realPoints={scores.EW} />
    </div>
</div>
