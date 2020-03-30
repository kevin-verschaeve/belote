<script>
    import { Collection, Doc } from "sveltefire";
    import { getContext } from 'svelte';
    import Card from './Card.svelte';
    import { createGame, dealPreGame, calculateRoundScores } from './GameManager.js';
    import { push } from 'svelte-spa-router'
    export let params;

    const db = getContext('firebase').firestore();

    const next = (game, players) => {
        db.doc(`games/${params.game}`).set(createGame(true, newScoreNS, newScoreEW)).then(() => {
            db.doc(`games/${params.game}`).get().then((doc) => {
                const deck = dealPreGame(players, doc.data().deck);
                doc.ref.update({deck: deck, started: true}).then(() => {
                    push(`/game/${params.game}/play`);
                });
            });
        });
    };

    let newScoreNS = 0, newScoreEW = 0;
    function isGameFinished(game, players) {
        const {scoreNS, scoreEW} = calculateRoundScores(game, players);
        newScoreNS = game.scoreNS + scoreNS;
        newScoreEW = game.scoreEW + scoreEW;

        if (newScoreNS > 1000 || newScoreEW > 1000) {
          newScoreNS = 0;
          newScoreEW = 0;

          return true;
        }

        return false;
    }
</script>

<Doc path={`games/${params.game}`} let:data={game}>
    {#if game.finished}
    <Collection path={`games/${params.game}/players`} let:data={players} let:ref={playersRef}>
        {#if isGameFinished(game, players)}
            <button on:click={next(game, players, true)}>Nouvelle partie</button>
        {:else}
            <button on:click={next(game, players)}>Manche suivante</button>
        {/if}
    </Collection>
    <div>
        <span>{game.taker} :</span>
        <div class="card mini">
            <div class="suit {game.atout}"></div>
        </div>
    </div>

    <div class="plis-wrapper">
        <h2>Équipe Nord - Sud</h2>
        <p>Total : {game.roundScoreNS}</p>
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
        <p>Total : {game.roundScoreEW}</p>
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
