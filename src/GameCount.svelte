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

        gameRef.set(createGame(true, deck)).then(() => {
            db.doc(`games/${params.game}`).get().then((doc) => {
                const deck = dealPreGame(players, doc.data().deck);
                const takeableCard = getOneCard(deck);

                doc.ref.update({deck, takeableCard, started: true}).then(() => {
                    push(`/game/${params.game}/play`);
                });
            });
        });
    };
</script>

<Doc path={`games/${params.game}`} let:data={game} let:ref={gameRef}>
    {#if game.finished}
    <Collection path={`games/${params.game}/players`} let:data={players} let:ref={playersRef}>
        <div>
            <label>
                Mélanger ?
                <input type="checkbox" bind:value={shake}>
            </label>
        </div>
        <button on:click={next(players, game, gameRef)}>Manche suivante</button>
    </Collection>
    <div>
        <span>{game.taker} :</span>
        <div class="card mini">
            <div class="suit {game.atout}"></div>
        </div>
    </div>

    <div id="final-score">
        <TeamScore plis={game.NS} team={'NS'}/>
        <TeamScore plis={game.EW} team={'EW'}/>
    </div>
    {:else}
        <a href="/#/game/{params.game}/play">Rejoindre la partie</a>
    {/if}
</Doc>
