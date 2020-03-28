import Home from './Home.svelte';
import Game from './Game.svelte';
import GameConfig from './GameConfig.svelte';
import GameCount from './GameCount.svelte';

export default {
  '/': Home,
  '/game/:game/play': Game,
  '/game/:game/config': GameConfig,
  '/game/:game/count': GameCount,
  '*': Home,
};
