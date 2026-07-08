import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    // Tauri plugins only exist inside the desktop process — never bundle them
    rolldownOptions: {
      external: [
        "@tauri-apps/plugin-dialog",
        "@tauri-apps/plugin-fs",
        "@tauri-apps/plugin-shell",
      ],
    },
    // Raise chunk warning threshold (react-pdf is legitimately large)
    chunkSizeWarningLimit: 1600,
  },
});
