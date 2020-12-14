<script>
    import { Collection } from 'sveltefire';
    import { push } from 'svelte-spa-router'
    import { getContext } from 'svelte';
    import { createGame, dealPreGame } from './GameManager.js';
    import { getOneCard } from './DeckManager.js';
    export let params;

    const db = getContext('firebase').firestore();
    let name = '';
    let skipFirst = true;
    let points = 1000;

    const addPlayer = (playersRef, length) => {
        playersRef.add({name, pos: length, hasCancelledACard: false});
        name = '';
    };

    const start = (players) => {
        const newGame = createGame();
        newGame.firstRoundSkipped = skipFirst;
        newGame.goal = points;
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

        batch.set(db.doc(`games/${params.game}`), newGame);

        batch.commit().then(() => push(`/game/${params.game}/play`));
    };

    const addToTeam = (team, player) => player.ref.update({team});
</script>

<Collection path={`games/${params.game}/players`} let:data={players} let:ref={playersRef} query={(ref) => ref.orderBy('pos')}>
    <section class="box">
        {#if players.length < 4}
            <div>
                <h5>Ajouter un joueur</h5>
                <input type="text" bind:value={name} on:keydown={(e) => e.key == 'Enter' ? addPlayer(playersRef, players.length) : false} autofocus>
                <button class="btn waves-effect waves-light" on:click={addPlayer(playersRef, players.length)}>Ajouter</button>
            </div>
        {:else}
            <button on:click={start(players)} class="btn waves-effect waves-light" type="submit" name="action">Lancer la partie</button>
        {/if}
    </section>
    <section class="box">
        <div class="row">
            <h5>Paramètres de partie</h5>
            <label>
                <input type="checkbox" bind:checked={skipFirst}>
                <span>Ne pas compter la première partie</span>
            </label>
            Partie en
            <div class="input-field inline">
                <input id="game-points" type="number" class="validate" bind:value={points}>
            </div>
            points
        </div>
    </section>
    <section class="box">
        <div class="row">
            {#each players as player}
                {#if !player.team}
                    <div class="col s6 m3">
                        <div class="card grey lighten-5">
                            <div class="card-content relative">
                                <span class="card-title">{player.name}</span>
                                <button on:click={() => player.ref.delete()} title="Supprimer le joueur" class="btn-remove-player">&times;</button>
                            </div>
                            <div class="card-action">
                                <button on:click={addToTeam('NS', player)} class="black-text pointer">Équipe 1</button>
                                <button on:click={addToTeam('EW', player)} class="black-text pointer">Équipe 2</button>
                            </div>
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
        <div class="row">
            <div class="col s12 m6">
                <div class="row">
                    <div class="col s12"><h4>Équipe 1</h4></div>
                    {#each players as player}
                        {#if player.team === 'NS'}
                            <div class="col s12 m6">
                                <div class="card grey lighten-5">
                                    <div class="card-content relative">
                                        <span class="card-title">{player.name}</span>
                                        <button on:click={() => player.ref.delete()} title="Supprimer le joueur" class="btn-remove-player">&times;</button>
                                    </div>
                                    <div class="card-action black-text">
                                        <button on:click={addToTeam('EW', player)} class="black-text pointer">Changer d'équipe</button>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
            <div class="col s12 m6">
                <div class="row">
                    <div class="col s12"><h4>Équipe 2</h4></div>
                    {#each players as player}
                        {#if player.team === 'EW'}
                            <div class="col s12 m6">
                                <div class="card grey lighten-5">
                                    <div class="card-content relative">
                                        <span class="card-title">{player.name}</span>
                                        <button on:click={() => player.ref.delete()} title="Supprimer le joueur" class="btn-remove-player">&times;</button>
                                    </div>
                                    <div class="card-action">
                                        <button on:click={addToTeam('NS', player)} class="black-text pointer">Changer d'équipe</button>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    </section>
</Collection>
