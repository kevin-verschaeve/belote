import { writable } from 'svelte/store';

export const bigCards = writable(localStorage.getItem('bigCards') === 'true' ? true : false);
bigCards.subscribe((value) => {
    localStorage.setItem('bigCards', value);
});

export const me = writable(localStorage.getItem('me'));
me.subscribe((value) => {
    localStorage.setItem('me', value);
});