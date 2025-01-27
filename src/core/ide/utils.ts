import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import clipboard from "clipboardy";
import type { FileType, FileStatsMap } from "core";

export async function getClipboardContent(): Promise<{
  text: string;
  copiedAt: string;
}> {
  const text = await clipboard.read();
  const copiedAt = new Date().toISOString();
  return { text, copiedAt };
}

export async function fileExists(fileUri: string): Promise<boolean> {
  return fs.existsSync(fileUri);
}

export async function readFile(fileUri: string): Promise<string> {
  const filepath = fileURLToPath(fileUri);
  return new Promise((resolve, reject) => {
    fs.readFile(
      filepath,
      {
        encoding: "utf8",
      },
      (err, contents) => {
        if (err) {
          reject(err);
        }
        resolve(contents);
      },
    );
  });
}

export async function writeFile(path: string, contents: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, contents, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

export async function openUrl(url: string): Promise<void> {
  const { execSync } = await import("child_process");
  execSync(`open ${url}`);
}

export async function getFileStats(files: string[]): Promise<FileStatsMap> {
  return Promise.all(
    files.map(async (file) => {
      const stat = await fs.promises.stat(file);
      return {
        lastModified: stat.mtimeMs,
        size: stat.size,
      };
    }),
  ).then((stats) => {
    return files.reduce((acc, file, i) => {
      acc[file] = stats[i];
      return acc;
    }, {} as FileStatsMap);
  });
}

export async function listDir(dir: string): Promise<[string, FileType][]> {
  return new Promise((resolve, reject) => {
    const File = 1;
    const Directory = 2;
    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
      if (err) {
        reject(err);
      }
      resolve(
        files.map((file) => [file.name, file.isDirectory() ? Directory : File]),
      );
    });
  });
}

export async function runCommand(command: string): Promise<void> {
  const { exec } = await import("child_process");
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
