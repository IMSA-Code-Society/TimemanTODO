import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import * as path from "path";

// Despite Vite supposedly supporting `require` (https://github.com/vitejs/vite/pull/8459), it does not work for my custom `delta-pouch`
// Tried `@originjs/vite-plugin-commonjs`, but it only works in dev. Had to change package.json from `workspace:` to `file:`
// See https://github.com/vitejs/vite/issues/2679#issuecomment-898940091

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => ({
  plugins: [svelte()],
  base: "/TimemanTODO",
  resolve:{
    alias:{
      '@' : path.resolve(__dirname, './src'),
      '$lib' : path.resolve(__dirname, './src/lib'),
    },
  },
  define: {
    // Vite doesn't include shims for Node globals, & pouchDb dependency uses it (see https://github.com/calvinmetcalf/immediate/pull/40)
    global: mode === "development" ? {} : "global",
    // If there are still issues, try Object.fromEntries(Object.entries(globalThis).filter(([key, val]) => val !== globalThis))
  }
}))
