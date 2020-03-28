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

            if (!game.dealComplete) {
                db.collection(`games/${gameId}/players`).get().then((snapshot) => {
                    players = snapshot.docs.map((d) => {
                        return {...d.data(), ...{id: d.id}}
                    });
                    card = getOneCard(game.deck);
                });
            }
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

    const pickUpNS = () => pickUp('NS');
    const pickUpEW = () => pickUp('EW');
    const pickUp = (team) => {
        db.doc(`games/${gameId}`).get().then((doc) => {
            const currentBoard = doc.data().board;
            let plis = doc.data()[team] || [];
            plis.push(JSON.stringify(currentBoard));

            db.doc(`games/${gameId}`).update({[team]: plis, board: [], nbPlis: firebase.firestore.FieldValue.increment(1), toPick: false});
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

            player.ref.update({cards}).then(() => {
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

    let lastPli;
    const getLastPliNS = () => getLastPli('NS');
    const getLastPliEW = () => getLastPli('EW');
    function getLastPli(team) {
        if (lastPli) {
          return;
        }

        let last = game[team].slice(-1);
        if (last.length) {
            lastPli = JSON.parse(last);
        }
    }
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
            <div>
                <div>
                    <button on:click={getLastPliNS}>Dernier plis NS</button>
                    <button on:click={getLastPliEW}>Dernier plis EW</button>
                </div>
                {#if lastPli}
                    <div class="player-cards">
                        {#each lastPli as card}
                            <Card {card}/>
                        {/each}
                    </div>
                    <button on:click={() => {lastPli = null}}>OK !</button>
                {/if}
            </div>
        </div>
        {/if}
        {#each game.board as card}
            <Card {card}>
                <div slot="cancel" class="cancel-card">
                {#if me == card.player}
                    <button on:click={cancelCard(card)} class="btn-cancel-card" title="Reprendre la carte">&times;</button>
                {/if}
                </div>
            </Card>
        {/each}
        {#if game.toPick}
        <div>
            <button on:click={pickUpNS}>Nord - Sud</button>
            <button on:click={pickUpEW}>Est - Ouest</button>
        </div>
        {/if}
        {#if game.nbPlis == 8}
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
