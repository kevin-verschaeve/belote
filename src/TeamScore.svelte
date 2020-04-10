<script>
    import Card from "./Card.svelte";
    export let plis;
    export let team;
</script>

<div class="plis-wrapper">
    <h2>Équipe {team == 'NS' ? 'Nord - Sud' : 'Est - Ouest'}</h2>
    {#if plis.length}
        {#each plis as pli}
            <div class="pli">
                {#each JSON.parse(pli) as card}
                    <Card {card}/>
                {/each}
            </div>
        {/each}
    {:else}
        <p class="capot">Capot dans vos gueules !</p>
        <img src="https://media.giphy.com/media/UTYz3M8lcTvqaVbSo9/source.gif" width="400">
    {/if}
</div>
