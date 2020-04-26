<script>
    import { getContext, afterUpdate, createEventDispatcher } from 'svelte';
    import { getOneCard, getPlayerCards, suits } from './DeckManager.js';
    import { createGame, dealPreGame } from './GameManager.js';
    import { findPliWinner } from './PliManager.js';
    import Card from './Card.svelte';

    export let game;
    export let gameRef;
    export let players;

    const firebase = getContext('firebase');
    const db = firebase.firestore();
    const dispatch = createEventDispatcher();

    afterUpdate(() => M.AutoInit());

    let atout;
    let me = localStorage.getItem('me');

    const setTaker = () => {
        const batch = db.batch();
        for (let player of players) {
            if (player.name == me) {
                game.takeableCard.player = player.name;
                player.cards.push(...[...getPlayerCards(game.deck, 2, player.name), game.takeableCard]);
            } else {
                player.cards.push(...getPlayerCards(game.deck, 3, player.name));
            }
            batch.update(player.ref, {cards: player.cards, canPlay: true});
        }

        batch.commit().then(() => {
            gameRef.update({deck: game.deck, dealComplete: true, taker: me, atout: atout || game.takeableCard.suit});
        });
    };

    const temp = () => {
        const winner = findPliWinner(game.board, game.atout);

        console.log(winner);
    };

    const pickUp = () => {
        const team = players.find((p) => p.name == me).team;
        const currentBoard = game.board;
        const pliWinner = findPliWinner(currentBoard, game.atout);
        let plis = game[team] || [];
        plis.push(JSON.stringify(currentBoard));

        gameRef.update({[team]: plis, lastPli: currentBoard, currentPlayer: pliWinner, board: [], nbPlis: firebase.firestore.FieldValue.increment(1), toPick: false});
    };

    function cancelCard(card) {
        const player = players.find((p) => p.name == card.player);
        const cards = player.cards;
        cards.push(card);

        // todo: new field when canceled ??
        player.ref.update({cards: cards}).then(() => {
            let board = game.board;
            const index = board.findIndex((c) => c.suit == card.suit && c.text == card.text);
            board = [...board.slice(0, index), ...board.slice(index + 1)];
            gameRef.update({board: board, toPick: board.length == 4});
            dispatch('cancelCard');
        });
    }

    function restart() {
        const newGame = createGame();
        newGame.deck = dealPreGame(players);
        newGame.takeableCard = getOneCard(newGame.deck);
        newGame.currentPlayer = players[Math.floor(Math.random() * players.length)].name;
        gameRef.set(newGame);
    }

    const findPlayerPos = (name) => {
        if (name == me) {
            return 'south';
        }

        const iam = players.find((p) => p.name == me);
        const mate = players.find((p) => p.team == iam.team && p.name != iam.name);

        if (mate.name == name) {
            return 'north';
        }

        const opponent = players.find((p) => p.team != iam.team && p.pos == (iam.pos + 1 > 3 ? 0 : iam.pos + 1));
        if (opponent.name == name) {
            return 'west';
        }

        return 'east';
    };
</script>

<div id="board">
    {#if game.dealComplete}
        {#if game.atout}
        <div id="game-infos">
            <div id="atout-indicator">
                <h3 id="taker">{game.taker}</h3>
                <div class="playing-card mini">
                    <div class="suit {game.atout}"></div>
                </div>
            </div>
            {#if game.lastPli}
                <button data-target="modal-last-pli" class="btn modal-trigger btn-block">Voir le dernier pli</button>
            {/if}
        </div>
        {/if}
        <div id="card-board">
            <div class="player-cards">
            {#each game.board as card}
                <Card {card} pos={findPlayerPos(card.player)}>
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
                    <button on:click={temp}>TEMP</button>
                    <button on:click={pickUp} id="btn-pickup" class="btn btn-block btn-large waves-effect waves-light">Ramasser le pli</button>
                </div>
            {/if}
        </div>
    {:else}
        <div class="box box-auto">
            <div id="game-infos">
                <button on:click={restart} id="btn-restart" class="btn btn-block waves-effect waves-light">Redistribuer</button>
            </div>
            {#if game.takeableCard}
            <div id="atout-chooser" class="center-align">
                <div id="take-one">
                    <h4>Prendre ?</h4>
                    <div>
                        <Card card={game.takeableCard} takeable={true}/>
                        <button on:click={setTaker} class="btn btn-block btn-large waves-effect waves-light">Je prends !</button>
                    </div>
                </div>

                <div id="take-two">
                    <p>En 2, cliquer sur la couleur voulue, puis sur le bouton "Prendre en 2"</p>
                    <div id="suits-two">
                        {#each suits as suit}
                            <div class="playing-card mini playable" class:selected-atout={suit == atout}>
                                <div class="suit {suit}" on:click={() => {atout = suit}}></div>
                            </div>
                        {/each}
                        <button on:click={setTaker} class="btn btn-block waves-effect waves-light">Prendre en 2</button>
                    </div>
                </div>
            </div>
            {/if}
        </div>
    {/if}
</div>

{#if game.lastPli}
<div id="modal-last-pli" class="modal bottom-sheet center-align">
    <div class="modal-content">
        <h4>
            Dernier pli
            <button class="btn modal-close waves-effect waves-green btn-flat right">OK</button>
        </h4>
        <div class="player-cards">
            {#each game.lastPli as card}
                <Card {card}>
                    <p class="played-card-player last-pli-card">{card.player}</p>
                </Card>
            {/each}
        </div>
    </div>
</div>
{/if}
