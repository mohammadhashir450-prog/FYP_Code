import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// SHOWCASE_BASE=/showcase/ is set when the app is bundled into the
// provider-dashboard (Next.js) so both ship as a single deployment.
const base = process.env.SHOWCASE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
  build: process.env.SHOWCASE_OUT_DIR
    ? { outDir: process.env.SHOWCASE_OUT_DIR, emptyOutDir: true }
    : undefined,
})
