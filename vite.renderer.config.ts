import { defineConfig } from 'vite';
import { join, resolve } from 'path';
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config
export default defineConfig({
  root: resolve(__dirname, "src", "gui"),
  plugins: [react(), tailwindcss()],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  build: {
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: {
        settings_window: resolve(__dirname, "src", "gui", "settings.html"),
        chat_window: resolve(__dirname, "src", "gui", "chat.html"),
      }
    },
  },
});
