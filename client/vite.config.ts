import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  define: {
    // Vite doesn't include shims for Node globals, & pouchDb dependency uses it (see https://github.com/calvinmetcalf/immediate/pull/40)
    global: {},
    // If there are still issues, try Object.fromEntries(Object.entries(globalThis).filter(([key, val]) => val !== globalThis))
  }
})
