<script>
    import { getContext } from 'svelte';
    import { getOneCard, getPlayerCards, suits } from './DeckManager.js';
    import { push } from 'svelte-spa-router';
    import { onMount } from 'svelte';
    import { dealPreGame } from './GameManager.js';
    import Card from './Card.svelte';
    export let gameId;

    const firebase = getContext('firebase');
    const db = firebase.firestore();

    let atout;
    let game;
    let players;
    let card;
    let me = localStorage.getItem('me');
    onMount(() => {
        db.doc(`games/${gameId}`).onSnapshot((doc) => {
            game = doc.data();

            db.collection(`games/${gameId}/players`).get().then((snapshot) => {
                players = snapshot.docs.map((d) => {
                    return {...d.data(), ...{id: d.id}}
                });
                if (!game.dealComplete) {
                    card = getOneCard(game.deck);
                }
            });
        });
    });

    const setTaker = (taker, card) => {
        db.doc(`games/${gameId}`).update({taker: taker, atout: atout || card.suit}).then(() => {
            for (let player of players) {
                if (player.name == taker) {
                    card.player = player.name;
                    player.cards.push(...[...getPlayerCards(game.deck, 2, player.name), card]);
                } else {
                    player.cards.push(...getPlayerCards(game.deck, 3, player.name));
                }
                db.doc(`games/${gameId}/players/${player.id}`).update({cards: player.cards});
                db.doc(`games/${gameId}`).update({deck: game.deck, dealComplete: true});
            }
        });
    };

    const pickUp = () => {
        const team = players.find((p) => p.name == me).team;
        db.doc(`games/${gameId}`).get().then((doc) => {
            const currentBoard = doc.data().board;
            let plis = doc.data()[team] || [];
            plis.push(JSON.stringify(currentBoard));

            db.doc(`games/${gameId}`).update({[team]: plis, lastPli: currentBoard, board: [], nbPlis: firebase.firestore.FieldValue.increment(1), toPick: false}).then(() => {
                db.collection(`games/${gameId}/players`).get().then((snapshot) => {
                    let batch = db.batch();
                    snapshot.forEach((doc) => {
                        batch.update(doc.ref, {canPlay: true});
                    });
                    batch.commit();
                });
            });
        });
    };

    function goToCount() {
        db.doc(`games/${gameId}`).update({finished: true}).then(() => {
            push(`/game/${gameId}/count`);
        });
    }

    function cancelCard(card) {
        db.collection(`games/${gameId}/players`).where('name', '==', card.player).limit(1).get().then((snapshot) => {
            const player = snapshot.docs[0];
            const cards = player.data().cards;
            cards.push(card);

            player.ref.update({cards: cards, canPlay: true}).then(() => {
                db.doc(`games/${gameId}`).get().then((doc) => {
                    let board = doc.data().board;
                    const index = board.findIndex((c) => c.suit == card.suit && c.value == card.value);
                    board = [...board.slice(0, index), ...board.slice(index + 1)];
                    db.doc(`games/${gameId}`).update({board: board, toPick: board.length == 4});
                });
            });
        });
    }

    function restart() {
        db.collection(`games/${gameId}/players`).get().then((snapshot) => {
            const players = snapshot.docs.map((p) => {return {...p.data(), ...{ref: p.ref}};});
            const deck = dealPreGame(players);
            db.doc(`games/${gameId}`).update({deck});
        });
    }

    let lastPli = false;
</script>

<div id="board">
    {#if game && game.dealComplete}
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
                            <Card {card} playable={false}/>
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
        {#if card}
        <div id="atout-chooser">
            <p>Prendre ?</p>
            <Card {card}/>

            <div>
                <button on:click={setTaker(me, card)}>Je prends !</button>
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
