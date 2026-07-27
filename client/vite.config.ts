import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // The deployed API only allows its own origin, so a browser on localhost is
  // blocked by CORS. Proxying through the dev server makes the call same-origin
  // from the browser's side; the hop to the API happens in node, where CORS
  // doesn't apply. Set VITE_API_URL=/api to route through it.
  const target = env.VITE_DEV_API_TARGET || 'https://petlog-server.onrender.com'

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
        },
      },
    },
  }
})
