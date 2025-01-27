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
  const path = fileURLToPath(fileUri);
  if (path) {
    return fs.existsSync(path);
  } else {
    return false;
  }
}

export async function readFile(fileUri: string): Promise<string> {
  const filepath = fileURLToPath(fileUri);
  return new Promise((resolve, reject) => {
    if (filepath) {
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
    } else {
      reject(new Error("Invalid file path"));
    }
  });
}

export async function writeFile(
  fileUri: string,
  contents: string,
): Promise<void> {
  const path = fileURLToPath(fileUri);
  return new Promise((resolve, reject) => {
    if (path) {
      fs.writeFile(path, contents, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    } else {
      reject(new Error("Invalid file path"));
    }
  });
}

export async function openUrl(url: string): Promise<void> {
  const { execSync } = await import("child_process");
  execSync(`open ${url}`);
}

export async function getFileStats(files: string[]): Promise<FileStatsMap> {
  const stats = files.map((file) => {
    const path = fileURLToPath(file);
    const stat = fs.statSync(path);
    return {
      lastModified: stat.mtimeMs,
      size: stat.size,
    };
  });
  return files.reduce((acc, file, i, _) => {
    acc[file] = stats[i];
    return acc;
  }, {} as FileStatsMap);
}

export function listDir(fileUri: string): Promise<[string, FileType][]> {
  const path = fileURLToPath(fileUri);
  return new Promise((resolve, reject) => {
    const File = 1;
    const Directory = 2;
    if (path) {
      fs.readdir(path, { withFileTypes: true }, (err, files) => {
        if (err) {
          reject(err);
        }
        resolve(
          files.map((file) => [
            file.name,
            file.isDirectory() ? Directory : File,
          ]),
        );
      });
    } else {
      reject("Invalid file path");
    }
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
