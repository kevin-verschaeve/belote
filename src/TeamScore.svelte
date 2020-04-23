<script>
    import Card from "./Card.svelte";
    export let plis;
    export let team;
    export let players;
</script>

<div class="plis-wrapper">
    <h3 class="text">{players.filter((p) => p.team == team).map((p) => p.name).join(' / ')}</h3>
    {#each plis as pli}
        <div class="pli">
            {#each JSON.parse(pli) as card}
                <Card {card}/>
            {/each}
        </div>
    {:else}
        <p class="capot text">Capot dans vos gueules !</p>
        <img src="https://media.giphy.com/media/UTYz3M8lcTvqaVbSo9/source.gif" width="400"/>
    {/each}
</div>
