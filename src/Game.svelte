<script>
    import { Doc, Collection } from "sveltefire";
    import { getContext, onMount, createEventDispatcher } from 'svelte';
    import { sortCards } from './DeckManager.js';
    import { me, bigCards } from './stores.js';
    import IsCardPlayable from './IsCardPlayable.js';
    import Card from './Card.svelte';
    import Board from './Board.svelte';
    import GameCount from "./GameCount.svelte";

    export let params;

    const db = getContext('firebase').firestore();
    const dispatch = createEventDispatcher();
    onMount(() => dispatch('routeEvent', {titleInCorner: true}));

    const isPlayer = (players) => players.findIndex((p) => p.name == $me) > -1;

    const play = (game, gameRef, player, card, players) => {
        if (!IsCardPlayable(game, players, player, card, $me)) {
            return;
        }

        db.runTransaction((transaction) => {
            return transaction.get(gameRef).then((g) => {
                const board = g.data().board;
                if (board.find((c) => c.suit == card.suit && c.text == card.text)) {
                  // prevent playing the same card twice by clicking too fast
                  return;
                }

                board.push(card);

                let currentPlayer = game.currentPlayer;
                if (!player.hasCancelledACard) {
                    currentPlayer = players.find((p) => p.pos == (player.pos + 1 > 3 ? 0 : player.pos + 1)).name;
                }

                const index = player.cards.findIndex((c) => c.suit == card.suit && c.text == card.text);
                transaction.update(player.ref, {cards: [...player.cards.slice(0, index), ...player.cards.slice(index + 1)], hasCancelledACard: false});
                transaction.update(g.ref, {board: board, toPick: board.length == 4, currentPlayer});
            });
        });
    };

    const reOrderPlayers = (players) => {
        const iam = players.find((p) => p.name == $me);
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
    {#if game.nbPlis >= 8}
        <GameCount {game} {gameRef} {players}/>
    {:else}
        {#if $me && isPlayer(players)}
        <div id="players" class:deal-complete={game.dealComplete}>
            {#each reOrderPlayers(players) as player, i}
                <div class="player-wrap {player.team} {['south', 'west', 'north', 'east'][i]}" class:big={$bigCards} class:hide-on-med-and-down={!game.dealComplete && $me !== player.name} class:player-turn={game.currentPlayer == player.name}>
                    <div>
                        {player.name} {#if game.currentPlayer == player.name}*{/if}
                        {#if $me == player.name}
                        <div>
                            <ul id="player-menu" class="dropdown-content">
                                <li><button>Fermer</button></li>
                                <li><button on:click={() => bigCards.set(!$bigCards)}>{$bigCards ? 'Petites' : 'Grandes'} cartes</button></li>
                                <li><button type="button" on:click={() => me.set(null)}>Je ne suis pas {player.name} !</button></li>
                            </ul>
                            <button id="player-menu-trigger" class="dropdown-trigger " data-target="player-menu">⚙</button>
                        </div>
                        {/if}
                        {#if game.dealer == player.name}
                            <span id="dealer" class="text">Dealer</span>
                        {/if}
                    </div>
                    <div class="player-cards">
                        {#each sortCards(player.cards, game.atout) as card}
                            {#if $me == player.name}
                                <Card {card} big={$bigCards} playable={IsCardPlayable(game, players, player, card, $me)} on:click={play(game, gameRef, player, card, players)} />
                            {:else}
                                <div class="playing-card playing-card-hidden" class:big={$bigCards}></div>
                            {/if}
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
        <div id="infos">
            <span>{players.filter((p) => p.team == 'EW').map((p) => p.name).join(' / ')} : {game.score.EW} ({game.globalScore.EW} / {game.goal})</span> <br>
            <span>{players.filter((p) => p.team == 'NS').map((p) => p.name).join(' / ')} : {game.score.NS} ({game.globalScore.NS} / {game.goal})</span>
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
                            <button class="btn waves-effect waves-light" on:click={() => me.set(player.name)}>{player.name}</button>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    {/if}
    </Collection>
</Doc>
