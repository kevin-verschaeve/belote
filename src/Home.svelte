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

<div>
    Créer une partie
    <input type="text" bind:value={name}>
    <button on:click={create}>Créer</button>
</div>
