<script>
    import { Collection, Doc } from "sveltefire";
    import { getContext } from 'svelte';
    import Card from './Card.svelte';
    import { createGame, dealPreGame } from './GameManager.js';
    import { push } from 'svelte-spa-router'
    export let params;

    const db = getContext('firebase').firestore();

    const next = (players) => {
        db.doc(`games/${params.game}`).set(createGame(true)).then(() => {
            db.doc(`games/${params.game}`).get().then((doc) => {
                const deck = dealPreGame(players, doc.data().deck);
                doc.ref.update({deck: deck, started: true}).then(() => {
                    push(`/game/${params.game}/play`);
                });
            });
        });
    };
</script>

<Doc path={`games/${params.game}`} let:data={game}>
    {#if game.finished}
    <Collection path={`games/${params.game}/players`} let:data={players} let:ref={playersRef}>
        <button on:click={next(players)}>Manche suivante</button>
    </Collection>
    <div>
        <span>{game.taker} :</span>
        <div class="card mini">
            <div class="suit {game.atout}"></div>
        </div>
    </div>

    <div class="plis-wrapper">
        <h2>Équipe Nord - Sud</h2>
        {#each game.NS as plis}
            <div class="plis">
                {#each JSON.parse(plis) as card}
                <Card {card}/>
                {/each}
            </div>
        {/each}
    </div>

    <div class="plis-wrapper">
        <h2>Équipe Est - Ouest</h2>
        {#each game.EW as plis}
        <div class="plis">
            {#each JSON.parse(plis) as card}
            <Card {card}/>
            {/each}
        </div>
        {/each}
    </div>
    {:else}
        <a href="/#/game/{params.game}/play">Rejoindre la partie</a>
    {/if}
</Doc>
