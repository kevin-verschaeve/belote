<script>
    import { Collection, Doc } from 'sveltefire';
    import { push } from 'svelte-spa-router'
    import { getContext } from 'svelte';
    import { dealPreGame } from './GameManager.js';
    import { getOneCard } from './DeckManager.js';
    export let params;

    const db = getContext('firebase').firestore();
    let name = '';

    const addPlayer = (playersRef, length) => {
        playersRef.add({name, canPlay: true, pos: length + 1});
        name = '';
    };

    const start = (game, gameRef, players) => {
        const deck = dealPreGame(players);

        const buffer = {NS: [], EW: []};
        for (let p of players) {
            buffer[p.team].push(p);
        }

        const newPlayers = [buffer.NS[0], buffer.EW[0], buffer.NS[1], buffer.EW[1]];
        const batch = db.batch();

        for (let i in players) {
            batch.update(players[i].ref, newPlayers[i]);
        }

        const takeableCard = getOneCard(deck);

        batch.commit().then(() => {
            gameRef.update({deck, takeableCard, started: true}).then(() => {
                push(`/game/${params.game}/play`);
            });
        });
    };

    const addToTeam = (team, player) => {
        player.ref.update({team});
    };
</script>

<Doc path={`games/${params.game}`} let:data={game} let:ref={gameRef}>
    <Collection path={`games/${params.game}/players`} let:data={players} let:ref={playersRef} query={(ref) => ref.orderBy('pos')} >
        <ol>
            {#each players as player}
                <li>
                    {player.name}
                    <button on:click={() => {player.ref.delete()}} title="Supprimer le joueur">X</button>
                    {#if player.team}
                        Equipe : {player.team} -
                        <button on:click={addToTeam('NS' == player.team ? 'EW' : 'NS', player)}>Changer d'équipe</button>
                    {:else}
                        <button on:click={addToTeam('NS', player)}>Equipe Nord / Sud</button>
                        <button on:click={addToTeam('EW', player)}>Equipe Est / Ouest</button>
                    {/if}
                </li>
            {/each}
        </ol>

        {#if players.length < 4}
            <div>
                Ajouter un joueur
                <input type="text" bind:value={name}>
                <button on:click={addPlayer(playersRef, players.length)}>Ajouter</button>
            </div>
        {:else}
            {#if game.teamsReady}
                <button on:click={start(game, gameRef, players)}>Lancer la partie</button>
            {:else}
                Faire les équipes
                <button on:click={() => {gameRef.update({teamsReady: true})}}>Équipes prêtes !</button>
            {/if}
        {/if}
    </Collection>
</Doc>
