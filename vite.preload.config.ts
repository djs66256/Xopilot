import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  // root: resolve(__dirname, "src", "preload"),
  // build: {
  //   sourcemap: true,
  //   rollupOptions: {
  //     input: {
  //       settings_preload: resolve(__dirname, "src", "preload", "settings.ts"),
  //       chat_preload: resolve(__dirname, "src", "preload", "chat.ts"),
  //     }
  //   },
  // },
});
