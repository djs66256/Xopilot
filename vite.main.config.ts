import { defineConfig } from "vite";
import { externalizeDepsPlugin } from "electron-vite";
import { CopySqlite3 } from "./plugins/vite-plugin-sqlite3";

// https://vitejs.dev/config
export default defineConfig({
  optimizeDeps: {
    // include: [
    //   "core",
    //   "core/core.ts",
    //   "continue/core",
    //   "continue/core/core.ts"
    // ],
  },
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
        "tree-sitter-wasms",
        "web-tree-sitter"
      //   "onnxruntime",
        // /node_modules\/[^sa]/
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
    // externalizeDepsPlugin({
    //   exclude: [
    //     "core"
    //   ]
    // })
    // CopySqlite3()
  ],
});