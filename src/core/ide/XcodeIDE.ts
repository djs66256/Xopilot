import * as child_process from "node:child_process";
import { exec } from "node:child_process";

import { EXTENSION_NAME } from "core/control-plane/env";
import { GetGhTokenArgs } from "core/protocol/ide";
import { editConfigJson, getConfigJsonPath } from "core/util/paths";

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
} from "core";

export class XcodeIDE implements IDE {

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
        remoteConfigServerUrl: "https://config.continue.dev",
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
      return Promise.resolve({
        text: "",
        copiedAt: new Date("1900-01-01").toISOString(),
      });
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
      return Promise.resolve(false);
    }
  
    writeFile(path: string, contents: string): Promise<void> {
      return Promise.resolve();
    }
  
    showVirtualFile(title: string, contents: string): Promise<void> {
      return Promise.resolve();
    }
  
    openFile(path: string): Promise<void> {
      return Promise.resolve();
    }
  
    openUrl(url: string): Promise<void> {
      return Promise.resolve();
    }
  
    runCommand(command: string): Promise<void> {
      return Promise.resolve();
    }
  
    saveFile(fileUri: string): Promise<void> {
      return Promise.resolve();
    }
  
    readFile(fileUri: string): Promise<string> {
      return Promise.resolve("");
    }
  
    readRangeInFile(fileUri: string, range: Range): Promise<string> {
      return Promise.resolve("");
    }
  
    showLines(fileUri: string, startLine: number, endLine: number): Promise<void> {
      return Promise.resolve();
    }
  
    getOpenFiles(): Promise<string[]> {
      return Promise.resolve([]);
    }

    getCurrentFile(): Promise<
      | undefined
      | {
          isUntitled: boolean;
          path: string;
          contents: string;
        }
    > {
      return Promise.resolve(undefined);
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
      return Promise.resolve([]);
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

