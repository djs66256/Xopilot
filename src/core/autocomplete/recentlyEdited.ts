import fs from "node:fs";
import { RangeInFileWithContents, Range } from "core";
import { getSymbolsForSnippet } from "core/autocomplete/context/ranking";
import { RecentlyEditedRange } from "core/autocomplete/util/types";

type VsCodeRecentlyEditedRange = {
  uri: string;
  range: Range;
} & Omit<RecentlyEditedRange, "filepath" | "range">;

interface VsCodeRecentlyEditedDocument {
  timestamp: number;
  uri: string;
}

export class RecentlyEditedTracker {
  private static staleTime = 1000 * 60 * 2;
  private static maxRecentlyEditedRanges = 3;
  private recentlyEditedRanges: VsCodeRecentlyEditedRange[] = [];

  private recentlyEditedDocuments: VsCodeRecentlyEditedDocument[] = [];
  private static maxRecentlyEditedDocuments = 10;

  constructor() {
    // vscode.workspace.onDidChangeTextDocument((event) => {
    //   event.contentChanges.forEach((change) => {
    //     const editedRange = {
    //       uri: event.document.uri,
    //       range: new vscode.Range(
    //         new vscode.Position(change.range.start.line, 0),
    //         new vscode.Position(change.range.end.line + 1, 0),
    //       ),
    //       timestamp: Date.now(),
    //     };
    //     this.insertRange(editedRange);
    //   });

    //   this.insertDocument(event.document.uri);
    // });

    setInterval(() => {
      this.removeOldEntries();
    }, 1000 * 15);
  }

  private async insertRange(
    editedRange: Omit<VsCodeRecentlyEditedRange, "lines" | "symbols">,
  ): Promise<void> {
    // Check for overlap with any existing ranges
    for (let i = 0; i < this.recentlyEditedRanges.length; i++) {
      let range = this.recentlyEditedRanges[i];
      if (range.range.intersection(editedRange.range)) {
        const union = range.range.union(editedRange.range);
        const contents = await this._getContentsForRange({
          ...range,
          range: union,
        });
        range = {
          ...range,
          range: union,
          lines: contents.split("\n"),
          symbols: getSymbolsForSnippet(contents),
        };
        return;
      }
    }

    // Otherwise, just add the new and maintain max size
    const contents = await this._getContentsForRange(editedRange);
    const newLength = this.recentlyEditedRanges.unshift({
      ...editedRange,
      lines: contents.split("\n"),
      symbols: getSymbolsForSnippet(contents),
    });
    if (newLength >= RecentlyEditedTracker.maxRecentlyEditedRanges) {
      this.recentlyEditedRanges = this.recentlyEditedRanges.slice(
        0,
        RecentlyEditedTracker.maxRecentlyEditedRanges,
      );
    }
  }

  private insertDocument(uri: string): void {
    // Don't add a duplicate
    if (this.recentlyEditedDocuments.some((doc) => doc.uri === uri)) {
      return;
    }

    const newLength = this.recentlyEditedDocuments.unshift({
      uri,
      timestamp: Date.now(),
    });
    if (newLength >= RecentlyEditedTracker.maxRecentlyEditedDocuments) {
      this.recentlyEditedDocuments = this.recentlyEditedDocuments.slice(
        0,
        RecentlyEditedTracker.maxRecentlyEditedDocuments,
      );
    }
  }

  private removeOldEntries() {
    this.recentlyEditedRanges = this.recentlyEditedRanges.filter(
      (entry) => entry.timestamp > Date.now() - RecentlyEditedTracker.staleTime,
    );
  }

  private async _getContentsForRange(
    entry: Omit<VsCodeRecentlyEditedRange, "lines" | "symbols">,
  ): Promise<string> {
    return this.readFile(entry.uri).then((content) =>
      content
        .toString()
        .split("\n")
        .slice(entry.range.start.line, entry.range.end.line + 1)
        .join("\n"),
    );
  }

  public async getRecentlyEditedRanges(): Promise<RecentlyEditedRange[]> {
    return this.recentlyEditedRanges.map((entry) => {
      return {
        ...entry,
        filepath: entry.uri.toString(),
      };
    });
  }

  private async readFile(filepath: string) {
    return new Promise((resolve, reject) => {
      fs.readFile(filepath, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  public async getRecentlyEditedDocuments(): Promise<
    RangeInFileWithContents[]
  > {
    const results = await Promise.all(
      this.recentlyEditedDocuments.map(async (entry) => {
        try {
          const contents = await this.readFile(entry.uri)
            .then((content) => content.toString());
          const lines = contents.split("\n");

          return {
            filepath: entry.uri.toString(),
            contents,
            range: {
              start: { line: 0, character: 0 },
              end: {
                line: lines.length - 1,
                character: lines[lines.length - 1].length,
              },
            },
          };
        } catch (e) {
          return null;
        }
      }),
    );

    return results.filter((result) => result !== null) as any;
  }
}
