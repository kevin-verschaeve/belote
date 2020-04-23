<script>
    import { Doc, Collection } from "sveltefire";
    import { getContext, onMount, createEventDispatcher } from 'svelte';
    import { sortCards } from './DeckManager.js';
    import Card from './Card.svelte';
    import Board from './Board.svelte';
    export let params;

    const db = getContext('firebase').firestore();
    const dispatch = createEventDispatcher();
    onMount(() => dispatch('routeEvent', {titleInCorner: true}));

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

        db.runTransaction((transaction) => {
            return transaction.get(gameRef).then((g) => {
                const board = g.data().board;
                board.push(card);

                const index = player.cards.findIndex((c) => c.suit == card.suit && c.text == card.text);
                player.ref.update({cards: [...player.cards.slice(0, index), ...player.cards.slice(index + 1)], canPlay: false});
                transaction.update(g.ref, {board: board, toPick: board.length == 4});
            });
        });
    };

    const reOrderPlayers = (players) => {
        const iam = players.find((p) => p.name == me);
        const west = players.find((p) => p.team != iam.team && p.pos == (iam.pos + 1 > 3 ? 0 : iam.pos + 1));

        return [
            iam,
            west,
            players.find((p) => p.team == iam.team && p.name != iam.name),
            players.find((p) => p.team == west.team && p.name != west.name),
        ];
    };
</script>

<Doc path={`games/${params.game}`} let:data={game} let:ref={gameRef}>
    <Collection path={gameRef.collection('players')} let:data={players} let:ref={playersRef} query={(ref) => ref.orderBy('pos')}>
    {#if me && isPlayer(players, me)}
        <div id="players" class:deal-complete={game.dealComplete}>
            {#each reOrderPlayers(players) as player, i}
                <div class="player-wrap {player.team} {['south', 'west', 'north', 'east'][i]}" class:hide-on-med-and-down={!game.dealComplete && me !== player.name}>
                    <p>
                        {player.name}
                        {#if me == player.name}
                            <button type="button" on:click={() => me = null} class="btn-change-player text right" title="Je ne suis pas {player.name} !">⛔</button>
                        {/if}
                    </p>
                    <div class="player-cards">
                        {#each sortCards(player.cards, game.atout) as card}
                            <div class="card-wrapper">
                                {#if me == player.name}
                                    <Card {card} playable={player.canPlay} on:click={play(game, gameRef, player, card)} />
                                {:else}
                                    <div class="playing-card playing-card-hidden"></div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
        <Board {game} {gameRef} {players}/>
    {:else}
        <div id="choose-player" class="box container">
            <div class="row center-align">
                <h3>Qui êtes-vous ?</h3>
            </div>
            <div class="row">
                {#each players as player}
                    <div class="col s3 center-align">
                        <button class="btn waves-effect waves-light" on:click={setPlayer(player)}>{player.name}</button>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
    </Collection>
</Doc>
