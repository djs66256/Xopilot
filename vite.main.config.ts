import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: "src/main.ts",
      external: [
        "sqlite3",
        "vectordb",
        "pg",
        "jsdom",
        "napi-v3",
        "ripgrep",
        "onnxruntime",
      ],
      output: {
        externalLiveBindings: false,
      },
    },
  },
});
