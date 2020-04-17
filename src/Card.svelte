<script>
    import { createEventDispatcher } from 'svelte';
    export let card;
    export let playable = false;
    export let takeable = false;

    const dispatch = createEventDispatcher();
    const click = () => dispatch('click');
</script>

<div class="playing-card" class:playable class:takeable on:click>
    <slot name="cancel"></slot>
    <div class="value top">{card.text}</div>
    <div class="{card.suit} top small-suit"></div>

    <div class="suit {card.suit}"></div>

    <div class="value bottom">{card.text}</div>
    <div class="{card.suit} bottom right-align small-suit"></div>
    <slot></slot>
</div>
