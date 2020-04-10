<script>
    import { getContext } from 'svelte';
    import { push } from 'svelte-spa-router';
    import { getOneCard, getPlayerCards, suits } from './DeckManager.js';
    import { dealPreGame } from './GameManager.js';
    import Card from './Card.svelte';
    export let game;
    export let gameRef;
    export let players;

    const firebase = getContext('firebase');
    const db = firebase.firestore();

    let atout;
    let me = localStorage.getItem('me');

    const setTaker = () => {
        gameRef.update({taker: me, atout: atout || game.takeableCard.suit}).then(() => {
            for (let player of players) {
                if (player.name == me) {
                    game.takeableCard.player = player.name;
                    player.cards.push(...[...getPlayerCards(game.deck, 2, player.name), game.takeableCard]);
                } else {
                    player.cards.push(...getPlayerCards(game.deck, 3, player.name));
                }
                player.ref.update({cards: player.cards});
                gameRef.update({deck: game.deck, dealComplete: true});
            }
        });
    };

    const pickUp = () => {
        const team = players.find((p) => p.name == me).team;
        const currentBoard = game.board;
        let plis = game[team] || [];
        plis.push(JSON.stringify(currentBoard));

        gameRef.update({[team]: plis, lastPli: currentBoard, board: [], nbPlis: firebase.firestore.FieldValue.increment(1), toPick: false}).then(() => {
            let batch = db.batch();
            players.map((p) => batch.update(p.ref, {canPlay: true}));
            batch.commit();
        });
    };

    function goToCount() {
        gameRef.update({finished: true}).then(() => {
            push(`/game/${gameRef.id}/count`);
        });
    }

    function cancelCard(card) {
        const player = players.find((p) => p.name == card.player);
        const cards = player.cards;
        cards.push(card);

        player.ref.update({cards: cards, canPlay: true}).then(() => {
            let board = game.board;
            const index = board.findIndex((c) => c.suit == card.suit && c.value == card.value);
            board = [...board.slice(0, index), ...board.slice(index + 1)];
            gameRef.update({board: board, toPick: board.length == 4});
        });
    }

    function restart() {
        const deck = dealPreGame(players);
        const takeableCard = getOneCard(deck);
        gameRef.update({deck, takeableCard});
    }

    let lastPli = false;
</script>

<div id="board">
    {#if game.dealComplete}
        {#if game.atout}
        <div>
            <h2 id="atout-indicator">
                <span>{game.taker} :</span>
                <div class="card mini">
                    <div class="suit {game.atout}"></div>
                </div>
            </h2>
            {#if game.lastPli}
            <div>
                <div>
                    <button on:click={() => lastPli = !lastPli}>{#if lastPli}OK !{:else}Voir le dernier pli{/if}</button>
                </div>
                {#if lastPli}
                    <div class="player-cards">
                        {#each game.lastPli as card}
                            <Card {card}/>
                        {/each}
                    </div>
                {/if}
            </div>
            {/if}
        </div>
        {/if}
        <div class="player-cards">
        {#each game.board as card}
            <Card {card}>
                <p class="played-card-player">{card.player}</p>
                <div slot="cancel" class="cancel-card">
                {#if me == card.player}
                    <button on:click={cancelCard(card)} class="btn-cancel-card" title="Reprendre la carte">&times;</button>
                {/if}
                </div>
            </Card>
        {/each}
        </div>
        {#if game.toPick}
        <div id="pickup">
            <button on:click={pickUp}>Ramasser le pli</button>
        </div>
        {/if}
        {#if game.nbPlis >= 8}
            <button on:click={goToCount}>Compter</button>
        {/if}
    {:else}
        <button on:click={restart}>Redistribuer</button>
        {#if game.takeableCard}
            <div id="atout-chooser">
                <p>Prendre ?</p>
                <Card card={game.takeableCard}/>

                <div>
                    <button on:click={setTaker}>Je prends !</button>
                </div>
                <div>
                    <p>En 2:</p>
                    <p>Cliquer sur la couleur voulue, puis sur le bouton "Je prends !"</p>
                </div>
                <div id="suits-two">
                    {#each suits as suit}
                        <div class="card mini playable" class:selected-atout={suit == atout}>
                            <div class="suit {suit}" on:click={() => {atout = suit}}></div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    {/if}
</div>
