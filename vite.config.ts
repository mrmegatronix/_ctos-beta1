import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

const getCommitInfo = () => {
  try {
    return execSync('git log -1 --format="%cd" --date=format:"%Y-%m-%d %H:%M:%S"').toString().trim();
  } catch (e) {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
  }
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        '__COMMIT_INFO__': JSON.stringify(getCommitInfo())
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
