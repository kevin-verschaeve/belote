<script>
    import { Doc, Collection } from "sveltefire";
    import { getContext, onMount, createEventDispatcher } from 'svelte';
    import { sortCards } from './DeckManager.js';
    import Card from './Card.svelte';
    import Board from './Board.svelte';
    export let params;

    const db = getContext('firebase').firestore();
    const dispatch = createEventDispatcher();
    onMount(() => dispatch('routeEvent', {title: false}));

    let myCards;
    let me = localStorage.getItem('me');
    const setPlayer = (player) => {
        localStorage.setItem('me', player.name);
        me = player.name;
    };

    const isPlayer = (players, name) => {
        return players.findIndex((p) => p.name == name) > -1;
    };

    const play = (game, gameRef, player, card) => {
        if (!player.canPlay) {
            return;
        }

        const index = player.cards.findIndex((c) => c.suit == card.suit && c.text == card.text);
        player.ref.update({cards: [...player.cards.slice(0, index), ...player.cards.slice(index + 1)], canPlay: false}).then(() => {
            const board = game.board;
            board.push(card);
            gameRef.update({board: board, toPick: board.length == 4});
        });
    };
</script>

<Doc path={`games/${params.game}`} let:data={game} let:ref={gameRef}>
    <Collection path={gameRef.collection('players')} let:data={players} let:ref={playersRef} query={(ref) => ref.orderBy('pos')}>
    {#if me && isPlayer(players, me)}
        <div id="game">
            <div id="players">
                {#each players as player}
                <div class="player-wrap {player.team}">
                    <p>{player.name} - {player.team}</p>
                    <div class="player-cards">
                        {#each sortCards(player.cards, game.atout) as card}
                            <div class="card-wrapper">
                                {#if me == player.name}
                                    <Card {card} playable={player.canPlay} on:click={play(game, gameRef, player, card)} />
                                {:else}
                                    <div class="card card-hidden"></div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
                {/each}
            </div>
            <Board {game} {gameRef} {players}/>
        </div>
    {:else}
        Qui êtes-vous ?
        {#each players as player}
            <button on:click={setPlayer(player)}>{player.name}</button>
        {/each}
    {/if}
    </Collection>
</Doc>
