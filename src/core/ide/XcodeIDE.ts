import * as child_process from "node:child_process";
import { exec } from "node:child_process";

import { Range, IDE } from "core";
import { EXTENSION_NAME } from "core/control-plane/env";
import { GetGhTokenArgs } from "core/protocol/ide";
import { editConfigJson, getConfigJsonPath } from "core/util/paths";

import * as URI from "uri-js";

/*
class XcodeIDE implements IDE {


    getIdeInfo(): Promise<IdeInfo> {
      return Promise.resolve({
        ideType: "Xcode",
        version: "14.0.1",
        isRunning: true,
      });
    }
  
    getIdeSettings(): Promise<IdeSettings>;
  
    getDiff(includeUnstaged: boolean): Promise<string[]>;
  
    getClipboardContent(): Promise<{ text: string; copiedAt: string }>;
  
    isTelemetryEnabled(): Promise<boolean>;
  
    getUniqueId(): Promise<string>;
  
    getTerminalContents(): Promise<string>;
  
    getDebugLocals(threadIndex: number): Promise<string>;
  
    getTopLevelCallStackSources(
      threadIndex: number,
      stackDepth: number,
    ): Promise<string[]>;
  
    getAvailableThreads(): Promise<Thread[]>;
  
    getWorkspaceDirs(): Promise<string[]>;
  
    getWorkspaceConfigs(): Promise<ContinueRcJson[]>;
  
    fileExists(fileUri: string): Promise<boolean>;
  
    writeFile(path: string, contents: string): Promise<void>;
  
    showVirtualFile(title: string, contents: string): Promise<void>;
  
    openFile(path: string): Promise<void>;
  
    openUrl(url: string): Promise<void>;
  
    runCommand(command: string): Promise<void>;
  
    saveFile(fileUri: string): Promise<void>;
  
    readFile(fileUri: string): Promise<string>;
  
    readRangeInFile(fileUri: string, range: Range): Promise<string>;
  
    showLines(fileUri: string, startLine: number, endLine: number): Promise<void>;
  
    getOpenFiles(): Promise<string[]>;
  
    getCurrentFile(): Promise<
      | undefined
      | {
          isUntitled: boolean;
          path: string;
          contents: string;
        }
    >;
  
    getPinnedFiles(): Promise<string[]>;
  
    getSearchResults(query: string): Promise<string>;
  
    subprocess(command: string, cwd?: string): Promise<[string, string]>;
  
    getProblems(fileUri?: string | undefined): Promise<Problem[]>;
  
    getBranch(dir: string): Promise<string>;
  
    getTags(artifactId: string): Promise<IndexTag[]>;
  
    getRepoName(dir: string): Promise<string | undefined>;
  
    showToast(
      type: ToastType,
      message: string,
      ...otherParams: any[]
    ): Promise<any>;
  
    getGitRootPath(dir: string): Promise<string | undefined>;
  
    listDir(dir: string): Promise<[string, FileType][]>;
  
    getLastModified(files: string[]): Promise<{ [path: string]: number }>;
  
    getGitHubAuthToken(args: GetGhTokenArgs): Promise<string | undefined>;
  
    // LSP
    gotoDefinition(location: Location): Promise<RangeInFile[]>;
  
    // Callbacks
    onDidChangeActiveTextEditor(callback: (fileUri: string) => void): void;

}

*/