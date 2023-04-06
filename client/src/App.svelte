<script lang="ts">
  import Router from 'svelte-spa-router';
  import {wrap} from 'svelte-spa-router/wrap'
  import Home from "./routes/home/Home.svelte";
  import NotFound from "./routes/NotFound.svelte";

  const routes = {
    '/': Home,

    // Wrapping the Author component
    // '/author/:first/:last?': wrap({
    //   asyncComponent: () => import('./routes/Author.svelte')
    // }),
    //
    // // Wrapping the Book component
    // '/book/*': wrap({
    //   asyncComponent: () => import('./routes/Book.svelte')
    // }),

    // Catch-all route last
    '*': NotFound,
  }
</script>

<Router {routes}/>
