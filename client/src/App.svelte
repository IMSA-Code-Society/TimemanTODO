<script lang="ts">
  import Router from 'svelte-spa-router';
  import {wrap} from 'svelte-spa-router/wrap'
  import Home from "./routes/home/Home.svelte";
  import NotFound from "./routes/NotFound.svelte";
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  setContext("timer", writable({}));

  const routes = {
    '/': Home,

    '/timer/:task?': wrap({
      asyncComponent: () => import('./routes/timer/Timer.svelte'),
    }),

    '/login': wrap({
      asyncComponent: () => import('./routes/login/Login.svelte'),
    }),

    '/test': wrap({
      asyncComponent: () => import('./routes/DbTest.svelte'),
    }),

    '/test3': wrap({
      asyncComponent: () => import('./routes/DbTest3.svelte'),
    }),

    // // Wrapping the Book component
    // '/book/*': wrap({
    //   asyncComponent: () => import('./routes/Book.svelte')
    // }),

    // Catch-all route last
    '*': NotFound,
  }
</script>

<Router {routes}/>
