<script>
    import { getContext } from 'svelte';
    import { push } from 'svelte-spa-router';
    import { createGame } from './GameManager.js';

    const db = getContext('firebase').firestore();

    let name = '';
    const create = () => {
        const gameId = name + '-' + Math.random().toString(36).substr(2, 6);
        db.doc(`games/${gameId}`).set(createGame());
        push(`/game/${gameId}/config`);
    };
</script>

<div id="home" class="box">
    <h4>Créer une nouvelle partie</h4>
    <input placeholder="Nom de la partie" type="text" bind:value={name}>
    <button class="btn waves-effect waves-light" on:click={create}>Créer</button>
</div>
