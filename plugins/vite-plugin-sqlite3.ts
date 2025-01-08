import fs from "fs";
import path from "path";
import { PluginOption } from "vite";

export function CopySqlite3(): PluginOption {
  return {
    name: "vite-plugin-node_sqlite3",
    apply: "build",
    enforce: "post",

    async buildEnd(error) {
      if (error) {
        console.error("Build failed with error:", error);
        return;
      }

      const sourcePath = path.resolve(
        __dirname,
        "..",
        "node_modules",
        "sqlite3",
        "build"
      );
      const destPath = path.resolve(__dirname, "..", "out");

      try {
        // 确保目标目录存在
        fs.mkdirSync(path.dirname(destPath), { recursive: true });

        // 复制文件或目录
        copyFileSyncOrDir(sourcePath, destPath);
        console.log(`Successfully copied node_sqlite3 to ${destPath}`);
      } catch (err) {
        console.error("Failed to copy node_sqlite3:", err);
      }
    },
  };
}

function copyFileSyncOrDir(src: string, dest: string) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((item) => {
      copyFileSyncOrDir(path.join(src, item), path.join(dest, item));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
