import { writable } from 'svelte/store';

export const bigCards = writable(localStorage.getItem('bigCards') === 'true' ? true : false);
bigCards.subscribe((value) => {
    localStorage.setItem('bigCards', value);
});