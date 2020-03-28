<script>
    import { createEventDispatcher } from 'svelte';
    export let card;
    export let playable;

    const dispatch = createEventDispatcher();
    const click = () => dispatch('click');
</script>

<div class="card" class:playable on:click>
    <slot name="cancel"></slot>
    <div class="value">{card.value}</div>
    <div class="suit {card.suit}"></div>
</div>
<slot></slot>
