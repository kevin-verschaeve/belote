<script>
    import { Collection } from "sveltefire";
    import { getContext } from 'svelte';
    import Card from './Card.svelte';
    import Board from './Board.svelte';
    export let params;

    const db = getContext('firebase').firestore();

    let myCards;
    let me = localStorage.getItem('me');
    const setPlayer = (player) => {
        localStorage.setItem('me', player.name);
        me = player.name;
    };

    const isPlayer = (players, name) => {
        return players.findIndex((p) => p.name == name) > -1;
    };

    const play = (player, card) => {
        const index = player.cards.findIndex((c) => c.suit == card.suit && c.value == card.value);
        player.ref.update({cards: [...player.cards.slice(0, index), ...player.cards.slice(index + 1)]}).then(() => {
            db.doc(`games/${params.game}`).get().then((doc) => {
                const board = doc.data().board;
                board.push(card);
                db.doc(`games/${params.game}`).update({board: board, toPick: board.length == 4});
            });
        });
    };

    function sortCards(cards) {
        return cards.sort(function (a, b) {
            if (a.suit < b.suit || (a.suit == b.suit && a.value < b.value)) {
                return -1;
            }

            return 1;
        });
    }
</script>

<Collection path={`games/${params.game}/players`} let:data={players} let:ref={playersRef}>
{#if me && isPlayer(players, me)}
    <div id="game">
        <div id="players">
            {#each players as player}
            <div class="player-wrap {player.team}">
                <p>{player.name} - {player.team}</p>
                <div class="player-cards">
                    {#each sortCards(player.cards) as card}
                        <div class="card-wrapper">
                            {#if me == player.name}
                                <Card {card} playable={true} on:click={play(player, card)} />
                            {:else}
                                <div class="card card-hidden"></div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
            {/each}
        </div>
        <Board gameId={params.game}/>
    </div>
{:else}
    Qui êtes-vous ?
    {#each players as player}
        <button on:click={setPlayer(player)}>{player.name}</button>
    {/each}
{/if}
</Collection>
