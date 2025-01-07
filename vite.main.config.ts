import { defineConfig } from "vite";
// import "vite-plu"
import fs from "fs";
function ClosePlugin() {
  return {
      name: 'ClosePlugin', // required, will show up in warnings and errors

      // use this to catch errors when building
      buildEnd(error) {
          if(error) {
              console.error('Error bundling')
              console.error(error)
              process.exit(1)
          } else {
              console.log('Build ended')
          }
      },

      // use this to catch the end of a build without errors
      closeBundle(id) {
          console.log('Bundle closed')
          process.exit(0)
      },
  }
}


// https://vitejs.dev/config
export default defineConfig({
  optimizeDeps: {
    // include: ["vectordb", "pg", "sqlite3", "jsdom", "napi-v3", "ripgrep"],
  },
  build: {
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: "src/main.ts",
      // external: [
      //   "sqlite3",
      //   "vectordb",
      //   "pg",
      //   "jsdom",
      //   "napi-v3",
      //   "ripgrep",
      //   "onnxruntime",
      // ],
      output: {
        externalLiveBindings: false,
      },
      plugins: [
        // {
        //   name: "[COPY] node_sqlite3",
        //   buildStart: () => {
        //     console.log("[COPY] node_sqlite3 start");
        //   },
        //   buildEnd: (error) => {
        //     console.log("[COPY] node_sqlite3");
        //     if (error) {
        //       return;
        //     }
        //     fs.copyFileSync(
        //       "node_modules/sqlite3/lib/build/Release/sqlite3.node",
        //       ".vite/build/node_sqlite3.node"
        //     );
        //   }
        // }
      ]
    },
    commonjsOptions: {
      include: [/node_modules\//],
    },
  },
  plugins: [
    // ClosePlugin()
    {
      name: "vite-plugin-node_sqlite3",
      apply: "build",
      enforce: "post",

      // buildStart: () => {
      //   return Promise.resolve();
      // },
      async buildEnd(error) {
        if (error) {
          return
        }
        // console.log("[COPY] node_sqlite3", fs.existsSync("node_modules/sqlite3/build/Release/sqlite3.node"), fs.existsSync(".vite/build/node_sqlite3.node"));
        // fs.copyFileSync(
        //   "./node_modules/sqlite3/build/Release/sqlite3.node",
        //   "./.vite/build/node_sqlite3.node"
        // );
        return
      }
    },
  ],
});
