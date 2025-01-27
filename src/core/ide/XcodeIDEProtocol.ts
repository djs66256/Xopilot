import { IdeInfo, Problem, Range } from "core";
import { Project } from "../project/types";

export interface WorkspaceInfo {

}

export interface ReadFileInput {
  fileUrl: string;
  range: Range | undefined;
}

export interface ReadFileOutput {
  content: string;
}

export interface WriteFileInput {
  fileUrl: string;
  content: string;
}

export interface WriteFileOutput {
  success: boolean;
}

export interface GetCurrentFileOutput {
  isUntitled: boolean;
  path: string;
  contents: string;
}

export interface ProjectWrapper {
  project: Project;
}

export interface IDEFromCoreToXcodeProtocol {
  "ide/getIdeInfo": [void, IdeInfo];
  "ide/getWorkspaces": [void, WorkspaceInfo[]];
  "ide/readFile": [ReadFileInput, ReadFileOutput];
  "ide/writeFile": [WriteFileInput, WriteFileOutput];
  "ide/getOpenFiles": [ProjectWrapper, string[]];
  "ide/getCurrentFile": [ProjectWrapper, GetCurrentFileOutput];
  "ide/getProblems": [string | undefined, Problem[]];
  // "ide/getAvailableThreads": [Thread[]];
  // "ide/getBranch": [string];
  // "ide/getGitHubAuthToken": [string | undefined];
  // "ide/getGitRootPath": [string | undefined];
  // "ide/getIdeSettings": [IdeSettings];
  // "ide/getLastModified":[]
}

export interface IDEFromXcodeToCoreProtocol {
  // "ide/fileExists": [boolean];
  // "ide/getClipboardContent": [
  //   {
  //     text: string;
  //     copiedAt: string;
  //   }
  // ];
  // "ide/getCurrentFile": [
  //   | undefined
  //   | {
  //       isUntitled: boolean;
  //      path: string;
}