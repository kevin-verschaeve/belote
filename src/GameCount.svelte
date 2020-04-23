<script>
    import { Collection, Doc } from "sveltefire";
    import { getContext } from 'svelte';
    import { push } from 'svelte-spa-router'
    import { createGame, dealPreGame } from './GameManager.js';
    import { getOneCard, cutDeck } from './DeckManager.js';
    import TeamScore from './TeamScore.svelte';
    export let params;

    const db = getContext('firebase').firestore();

    let shake = false;

    const next = (players, game, gameRef) => {
        let deck = null;
        if (!shake) {
            deck = [];
            [...game.NS, ...game.EW].map((pli) => deck.push(...JSON.parse(pli)));
            deck = cutDeck(deck);
        }

        const newGame = createGame(true, deck);
        newGame.deck = dealPreGame(players, newGame.deck);
        newGame.takeableCard = getOneCard(newGame.deck);
        gameRef.set(newGame).then(() => push(`/game/${params.game}/play`));
    };
</script>

<Doc path={`games/${params.game}`} let:data={game} let:ref={gameRef}>
    {#if game.finished}
    <h2 class="center-align text">Score</h2>
    <Collection path={`games/${params.game}/players`} let:data={players} let:ref={playersRef}>
        <label>
            <input type="checkbox" bind:value={shake} class="filled-in">
            <span class="text">Mélanger ?</span>
        </label>
        <br>
        <button on:click={next(players, game, gameRef)} class="btn btn-block btn-large waves-effect waves-light">Manche suivante</button>
    </Collection>

    <div id="final-score">
        <TeamScore plis={game.NS} team={'NS'}/>
        <div>
            <p class="text">{game.taker}</p>
            <div class="playing-card mini">
                <div class="suit {game.atout}"></div>
            </div>
        </div>
        <TeamScore plis={game.EW} team={'EW'}/>
    </div>
    {:else}
        {push(`/game/${params.game}/play`)}
    {/if}
</Doc>
