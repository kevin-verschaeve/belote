<script>
    import { fly } from 'svelte/transition';
    import { quintInOut } from 'svelte/easing';

    export let card;
    export let playable = false;
    export let takeable = false;
    export let pos = false;
    export let big = false;

    let map = {
        north: {x: 0, y: -500},
        east: {x: 500, y: 0},
        south: {x: 0, y: 500},
        west: {x: -500, y: 0},
    };
</script>

<div class="playing-card" class:big class:playable class:takeable on:click in:fly="{{duration: pos ? 300 : 0, ...map[pos], easing: quintInOut}}">
    <slot name="cancel"></slot>
    <div class="value top">{card.text}</div>
    <div class="{card.suit} top small-suit"></div>

    <div class="suit {card.suit}"></div>

    <div class="value bottom">{card.text}</div>
    <div class="{card.suit} bottom right-align small-suit"></div>
    <slot></slot>
</div>
