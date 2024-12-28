import { defineConfig } from 'vite';
import { join, resolve } from 'path';

// https://vitejs.dev/config
export default defineConfig({
  root: resolve(__dirname, "src", "gui"),
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        settings_window: resolve(__dirname, "src", "gui", "settings.html"),
        chat_window: resolve(__dirname, "src", "gui", "chat.html"),
      }
    },
  },
});
