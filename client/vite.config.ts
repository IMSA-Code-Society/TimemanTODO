import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => ({
  // Despite Vite supposedly supporting `require` (https://github.com/vitejs/vite/pull/8459), it does not work for my custom `delta-pouch`
  plugins: [viteCommonjs(), svelte()],
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
