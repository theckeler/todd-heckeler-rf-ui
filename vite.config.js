import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Two settings together make the built dist/index.html work when opened
// directly via file://, which is RainFocus's "unzip and load the build
// file" requirement:
//
//   base: './'        — relative asset paths instead of domain-root paths.
//   format: 'iife'    — a plain <script> instead of <script type="module">.
//                       Module scripts are subject to CORS, and a file://
//                       page has a null origin, so the browser refuses to
//                       load the bundle and the app never mounts. base
//                       alone doesn't fix that; it only fixes the paths.
//
// https://vite.dev/config/
// Vite hardcodes type="module" + crossorigin on the entry script even when
// the output format is iife, so rewrite that one tag. Two things matter:
//   - dropping type="module"/crossorigin, so file:// doesn't CORS-block it
//   - adding defer, because module scripts are deferred by default and
//     classic ones are not — without it the bundle runs from <head> before
//     <div id="root"> exists and the mount throws.
// Scoped to the script tag so the font preconnect keeps its crossorigin.
const fileProtocolScript = {
  name: 'file-protocol-script',
  enforce: 'post',
  apply: 'build',
  transformIndexHtml(html) {
    return html.replace(
      /<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g,
      (_match, src) => `<script defer src="${src}"></script>`,
    )
  },
}

export default defineConfig({
  base: './',
  plugins: [react(), fileProtocolScript],
  build: {
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
  server: {
    port: Number(process.env.PORT) || 5173,
  },
})
