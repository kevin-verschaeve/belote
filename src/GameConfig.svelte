<script>
    import { Collection, Doc } from 'sveltefire';
    import { push } from 'svelte-spa-router'
    import { getContext } from 'svelte';
    import { dealPreGame } from './GameManager.js';
    export let params;

    const db = getContext('firebase').firestore();
    let name = '';

    const addPlayer = (playersRef) => {
        playersRef.add({name: name, canPlay: true});
        name = '';
    };

    const start = (game, gameRef, players) => {
        const deck = dealPreGame(players, game.deck);
        gameRef.update({deck: deck, started: true}).then(() => {
            push(`/game/${params.game}/play`);
        });
    };

    const addToTeam = (team, player) => {
        player.ref.update({team});
    };
</script>

<Doc path={`games/${params.game}`} let:data={game} let:ref={gameRef}>
    <Collection path={`games/${params.game}/players`} let:data={players} let:ref={playersRef}>
        <div class="box">
            <ol>
                {#each players as player}
                    {#if !player.team}  
                        <li>
                            {player.name}
                            <button on:click={() => {player.ref.delete()}} title="Supprimer le joueur">X</button>
                            {#if !player.team}
                                <button on:click={addToTeam('NS', player)}>Equipe Nord / Sud</button>
                                <button on:click={addToTeam('EW', player)}>Equipe Est / Ouest</button>
                            {/if}
                        </li>
                    {/if}   
                {/each}
            </ol>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Equipe Nord / Sud</th>
                            <th>Equipe Est / Ouest</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                            {#each players as player}
                                {#if player.team === 'NS'}
                                    {player.name}
                                    <button on:click={() => {player.ref.delete()}} title="Supprimer le joueur">X</button>
                                    <button on:click={addToTeam('NS' == player.team ? 'EW' : 'NS', player)}>Changer d'équipe</button><br/>
                                {/if}
                            {/each}
                            </td>
                            <td>
                                {#each players as player}
                                    {#if player.team === 'EW'}
                                        {player.name}
                                         <button on:click={() => {player.ref.delete()}} title="Supprimer le joueur">X</button>
                                        <button on:click={addToTeam('NS' == player.team ? 'EW' : 'NS', player)}>Changer d'équipe</button><br/>
                                    {/if}
                                {/each}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
        <br/>
        <div class="box">
        {#if players.length < 4}            
            <span>Ajouter un joueur</span>
            <input type="text" bind:value={name}>
            <button class="btn waves-effect waves-light" on:click={addPlayer(playersRef)}>Ajouter</button>
        {:else}
           
            {#if game.teamsReady}
                <button on:click={start(game, gameRef, players)}>Lancer la partie</button>
            {:else}
                <span>Faire les équipes</span>
                <button on:click={() => {gameRef.update({teamsReady: true})}}>Équipes prêtes !</button>
            {/if}
        {/if}
        </div>
    </Collection>
</Doc>
