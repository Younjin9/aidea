import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
<<<<<<< HEAD
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(
            /%VITE_KAKAO_JAVASCRIPT_KEY%/g,
            env.VITE_KAKAO_JAVASCRIPT_KEY || ''
          );
        },
      },
    ],
=======
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
>>>>>>> 07aa0750c67c41862888b229e90a94d07fe97e69
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
<<<<<<< HEAD
  };
=======
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
>>>>>>> 07aa0750c67c41862888b229e90a94d07fe97e69
})
