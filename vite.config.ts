
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    console.log('Vite Config Environment Check:', {
      mode,
      hasEnvGemini: !!env.GEMINI_API_KEY,
      hasProcessGemini: !!process.env.GEMINI_API_KEY,
      hasProcessApiKey: !!process.env.API_KEY,
    });
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        rollupOptions: {
          input: {
            main: path.resolve('.', 'index.html'),
            popup: path.resolve('.', 'popup.html'),
          },
        },
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || ''),
        'process.env.GOOGLE_KEY_PRO1': JSON.stringify(env.GOOGLE_KEY_PRO1 || process.env.GOOGLE_KEY_PRO1 || ''),
        'process.env.GOOGLE_KEY_PRO9': JSON.stringify(env.GOOGLE_KEY_PRO9 || process.env.GOOGLE_KEY_PRO9 || ''),
        'process.env.TTS_API_KEY': JSON.stringify(env.TTS_API_KEY || env.GEMINI_API_KEY || env.API_KEY || process.env.TTS_API_KEY || '')
      },
      resolve: {
        alias: {
          // Fixed: use path.resolve() which defaults to the current working directory, avoiding potential type issues with process.cwd()
          '@': path.resolve('.'),
        }
      }
    };
});
