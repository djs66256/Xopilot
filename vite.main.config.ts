import { defineConfig } from "vite";
import { CopySqlite3 } from "./plugins/vite-plugin-sqlite3";

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
      //   "onnxruntime",
      ],
      output: {
        externalLiveBindings: false,
      }
    },
    // commonjsOptions: {
    //   include: [/node_modules\//],
    // },
  },
  plugins: [
    // CopySqlite3()
  ],
});