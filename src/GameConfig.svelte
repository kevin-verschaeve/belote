<script>
    import { Collection } from 'sveltefire';
    import { push } from 'svelte-spa-router'
    import { getContext } from 'svelte';
    import { createGame, dealPreGame } from './GameManager.js';
    import { getOneCard } from './DeckManager.js';
    export let params;

    const db = getContext('firebase').firestore();
    let name = '';

    const addPlayer = (playersRef, length) => {
        playersRef.add({name, pos: length, hasCancelledACard: false});
        name = '';
    };

    const start = (players) => {
        const newGame = createGame();
        const dealer = players[Math.floor(Math.random() * players.length)];

        const buffer = {NS: [], EW: []};
        for (let p of players) {
            buffer[p.team].push(p);
        }

        if (buffer.NS.length != 2 || buffer.EW.length != 2) {
            return;
        }

        const newPlayers = [buffer.NS[0], buffer.EW[0], buffer.NS[1], buffer.EW[1]];
        const batch = db.batch();

        newGame.deck = dealPreGame(newPlayers, dealer);
        for (let player of players) {
            batch.update(player.ref, {pos: newPlayers.findIndex((p) => p.name == player.name)});
        }

        newGame.takeableCard = getOneCard(newGame.deck);
        newGame.dealer = dealer.name;
        newGame.currentPlayer = newPlayers.find((p) => p.team != dealer.team && p.pos == (dealer.pos + 1 > 3 ? 0 : dealer.pos + 1)).name;

        batch.commit().then(() => {
            db.doc(`games/${params.game}`).set(newGame).then(() => push(`/game/${params.game}/play`));
        });
    };

    const addToTeam = (team, player) => player.ref.update({team});
</script>

<Collection path={`games/${params.game}/players`} let:data={players} let:ref={playersRef} query={(ref) => ref.orderBy('pos')}>
    <section class="box">
        <div class="row">
            <ul class="no-style">
                {#each players as player}
                    {#if !player.team}
                        <li>
                            <div class="row">
                                <div class="col s12">
                                    <div class="card horizontal blue-grey darken-1 valign-wrapper">
                                        <div class="card-content white-text">
                                            <span class="card-title">{player.name}</span>
                                        </div>
                                        <div class="card-action no-border">
                                            <a on:click={() => player.ref.delete()} title="Supprimer le joueur">Supprimer</a>
                                            {#if !player.team}
                                                <a on:click={addToTeam('NS', player)}>Equipe Nord / Sud</a>
                                                <a on:click={addToTeam('EW', player)}>Equipe Est / Ouest</a>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    {/if}
                {/each}
            </ul>
        </div>
        <div class="row">
            <div class="col s12 m6"><h4>Equipe Nord / Sud</h4></div>
            <div class="col s12 m6"><h4>Equipe Est / Ouest</h4></div>
        </div>
        <div class="row">
            <div class="col s12 m6">
                {#each players as player}
                    {#if player.team === 'NS'}
                        <div class="row">
                            <div class="col s12">
                                <div class="card horizontal blue-grey darken-1 valign-wrapper">
                                    <div class="card-content white-text">
                                        <span class="card-title">{player.name}</span>
                                    </div>
                                    <div class="card-action no-border">
                                        <a on:click={() => player.ref.delete()} title="Supprimer le joueur">Supprimer</a>
                                        <a on:click={addToTeam('EW', player)}>Changer d'équipe</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
            <div class="col s12 m6">
                {#each players as player}
                    {#if player.team === 'EW'}
                        <div class="row">
                            <div class="col s12">
                                <div class="card horizontal blue-grey darken-1 valign-wrapper">
                                    <div class="card-content white-text">
                                        <span class="card-title">{player.name}</span>
                                    </div>
                                    <div class="card-action no-border">
                                        <a on:click={() => player.ref.delete()} title="Supprimer le joueur">Supprimer</a>
                                        <a on:click={addToTeam('NS', player)}>Changer d'équipe</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
        </div>
    </section>
    <br>
    <section class="box">
        {#if players.length < 4}
            <div>
                <span>Ajouter un joueur</span>
                <input type="text" bind:value={name}>
                <button class="btn waves-effect waves-light" on:click={addPlayer(playersRef, players.length)}>Ajouter</button>
            </div>
        {:else}
            <button on:click={start(players)} class="btn waves-effect waves-light" type="submit" name="action">Lancer la partie</button>
        {/if}
    </section>
</Collection>
