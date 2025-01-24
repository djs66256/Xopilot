// import * as child_process from "node:child_process";
// import { exec } from "node:child_process";

// import { EXTENSION_NAME } from "core/control-plane/env";
import { GetGhTokenArgs } from "core/protocol/ide";
// import { editConfigJson, getConfigJsonPath } from "core/util/paths";
import {
  getClipboardContent,
  fileExists,
  writeFile,
  getFileStats,
  openUrl,
  runCommand,
  readFile,
  listDir,
} from "./utils";

import type {
  Range,
  ContinueRcJson,
  FileType,
  IDE,
  IdeInfo,
  IdeSettings,
  IndexTag,
  Location,
  Problem,
  RangeInFile,
  Thread,
  ToastType,
  FileStatsMap,
} from "core";
import { XcodeChannel } from "../messages/XcodeChannel";

export class XcodeIDE implements IDE {
  constructor(readonly inspectorChannel: XcodeChannel) {}

  getIdeInfo(): Promise<IdeInfo> {
    return Promise.resolve({
      ideType: "xcode",
      version: "14.0.1",
      name: "Xcode",
      remoteName: "local",
      extensionVersion: "0.1",
    } as IdeInfo);
  }

  getIdeSettings(): Promise<IdeSettings> {
    return Promise.resolve({
      remoteConfigServerUrl: undefined,
      remoteConfigSyncPeriod: 60,
      userToken: "na",
      enableControlServerBeta: false,
      pauseCodebaseIndexOnStart: false,
      enableDebugLogs: false,
    } as IdeSettings);
  }

  getDiff(includeUnstaged: boolean): Promise<string[]> {
    return Promise.resolve([]);
  }

  getClipboardContent(): Promise<{ text: string; copiedAt: string }> {
    return getClipboardContent();
  }

  isTelemetryEnabled(): Promise<boolean> {
    return Promise.resolve(false);
  }

  id: string = "xcode";
  getUniqueId(): Promise<string> {
    return Promise.resolve(this.id);
  }

  getTerminalContents(): Promise<string> {
    return Promise.resolve("");
  }

  getDebugLocals(threadIndex: number): Promise<string> {
    return Promise.resolve("");
  }

  getTopLevelCallStackSources(
    threadIndex: number,
    stackDepth: number,
  ): Promise<string[]> {
    return Promise.resolve([]);
  }

  getAvailableThreads(): Promise<Thread[]> {
    return Promise.resolve([]);
  }

  getWorkspaceDirs(): Promise<string[]> {
    return Promise.resolve([]);
  }

  getWorkspaceConfigs(): Promise<ContinueRcJson[]> {
    return Promise.resolve([]);
  }

  fileExists(fileUri: string): Promise<boolean> {
    return fileExists(fileUri);
  }

  getFileStats(files: string[]): Promise<FileStatsMap> {
    return getFileStats(files);
  }

  async writeFile(path: string, contents: string): Promise<void> {
    try {
      let result = await this.inspectorChannel.request("ide/writeFile", {
        fileUrl: path,
        content: contents,
      });
      if (!result.success) {
        await writeFile(path, contents);
      }
    } catch {}
  }

  showVirtualFile(title: string, contents: string): Promise<void> {
    return Promise.resolve();
  }

  openFile(path: string): Promise<void> {
    return openUrl(path);
  }

  openUrl(url: string): Promise<void> {
    return openUrl(url);
  }

  runCommand(command: string): Promise<void> {
    return runCommand(command);
  }

  saveFile(fileUri: string): Promise<void> {
    return Promise.resolve();
  }

  async readFile(fileUri: string): Promise<string> {
    let content: string;
    try {
      let result = await this.inspectorChannel.request("ide/readFile", {
        fileUrl: fileUri,
        range: undefined,
      });
      content = result.content;
    } catch {}
    if (!content) {
      content = await readFile(fileUri);
    }
    return content;
  }

  async readRangeInFile(fileUri: string, range: Range): Promise<string> {
    let content: string;
    try {
      let result = await this.inspectorChannel.request("ide/readFile", {
        fileUrl: fileUri,
        range: range,
      });
      content = result.content;
    } catch {}
    if (!content) {
      content = await readFile(fileUri);
    }
    return content;
  }

  showLines(
    fileUri: string,
    startLine: number,
    endLine: number,
  ): Promise<void> {
    return Promise.resolve();
  }

  async getOpenFiles(): Promise<string[]> {
    try {
      let result = await this.inspectorChannel.request(
        "ide/getOpenFiles",
        void 0,
      );
      return result;
    } catch {
      return [];
    }
  }

  async getCurrentFile(): Promise<
    | undefined
    | {
        isUntitled: boolean;
        path: string;
        contents: string;
      }
  > {
    try {
      let result = await this.inspectorChannel.request(
        "ide/getCurrentFile",
        void 0,
      );
      return result;
    } catch {
      return undefined;
    }
  }

  getPinnedFiles(): Promise<string[]> {
    return Promise.resolve([]);
  }

  getSearchResults(query: string): Promise<string> {
    return Promise.resolve("");
  }

  subprocess(command: string, cwd?: string): Promise<[string, string]> {
    return Promise.resolve(["", ""]);
  }

  getProblems(fileUri?: string | undefined): Promise<Problem[]> {
    return Promise.resolve([]);
  }

  getBranch(dir: string): Promise<string> {
    return Promise.resolve("");
  }

  getTags(artifactId: string): Promise<IndexTag[]> {
    return Promise.resolve([]);
  }

  getRepoName(dir: string): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  showToast(
    type: ToastType,
    message: string,
    ...otherParams: any[]
  ): Promise<any> {
    return Promise.resolve();
  }

  getGitRootPath(dir: string): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  listDir(dir: string): Promise<[string, FileType][]> {
    return listDir(dir);
  }

  getLastModified(files: string[]): Promise<{ [path: string]: number }> {
    return Promise.resolve({});
  }

  getGitHubAuthToken(args: GetGhTokenArgs): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  // LSP
  gotoDefinition(location: Location): Promise<RangeInFile[]> {
    return Promise.resolve([]);
  }

  // Callbacks
  onDidChangeActiveTextEditor(callback: (fileUri: string) => void): void {
    return;
  }
}
