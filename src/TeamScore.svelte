<script>
    import Card from "./Card.svelte";
    export let plis;
    export let players;
    export let points;
    export let realPoints;
    export let globalScore;
    export let goal;
</script>

<div class="plis-wrapper">
    <h3 class="text">{players.map((p) => p.name).join(' / ')}</h3>
    <p class="score-points">Partie : {globalScore} / {goal}</p>
    <p class="score-points">Manche : {points} points {#if points != realPoints} -> <b>{realPoints} points</b>{/if}</p>
    {#each plis as pli}
        <div class="pli">
            {#each JSON.parse(pli) as card}
                <Card {card}/>
            {/each}
        </div>
    {:else}
        <p class="capot text">Capot dans vos gueules !</p>
        <img src="https://media.giphy.com/media/UTYz3M8lcTvqaVbSo9/source.gif" width="400" alt="Drop the mic"/>
    {/each}
</div>
