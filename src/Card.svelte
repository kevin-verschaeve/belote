<script>
    export let card;
</script>

<div class="card">
    <slot name="cancel"></slot>
    <div class="value">{card.value}</div>
    <div class="suit {card.suit}"></div>
</div>
<slot></slot>
