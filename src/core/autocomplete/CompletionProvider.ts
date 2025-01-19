import { IDE, Position, Range } from "core";
import { ConfigHandler } from "core/config/ConfigHandler";
import {
  AutocompleteInput,
  AutocompleteOutcome,
} from "core/autocomplete/util/types";
import { CompletionProvider } from "core/autocomplete/CompletionProvider";
import { Project } from "../project/types";
import { TabAutocompleteModel } from "./loadAutocompleteModel";
import { getDefinitionsFromLsp } from "./lsp";
import { RecentlyEditedTracker } from "./recentlyEdited";
import { XcodeChannel } from "../messages/XcodeChannel";
import { v4 as uuidv4 } from "uuid";
import { diffWords, Change } from "diff";
import { DocumentImpl } from "./Document";
import { AutocompleteOutput } from "./types";

// interface DiffType {
//   count: number;
//   added: boolean;
//   removed: boolean;
//   value: string;
// }

export class XcodeCompletionProvider {
  // private autocompleteCache = AutocompleteLruCache.get();
  public errorsShown: Set<string> = new Set();
  // private bracketMatchingService = new BracketMatchingService();
  // private debouncer = new AutocompleteDebouncer();
  // private completionStreamer: CompletionStreamer;
  // private loggingService = new AutocompleteLoggingService();
  // private contextRetrievalService: ContextRetrievalService;
  private completionProvider: CompletionProvider;
  private recentlyEditedTracker = new RecentlyEditedTracker();
  _lastShownCompletion: AutocompleteOutcome | undefined;

  constructor(
    private readonly project: Project,
    private readonly configHandler: ConfigHandler,
    private readonly ide: IDE,
    private readonly xcodeChannel: XcodeChannel,
    private readonly tabAutocompleteModel: TabAutocompleteModel,
  ) {
    this.completionProvider = new CompletionProvider(
      this.configHandler,
      this.ide,
      this.tabAutocompleteModel.get.bind(this.tabAutocompleteModel),
      this.onError.bind(this),
      getDefinitionsFromLsp,
    );
    // this.completionStreamer = new CompletionStreamer(this.onError.bind(this));
    // this.contextRetrievalService = new ContextRetrievalService(this.ide);
  }

  private onError(e: any) {
    console.error("Error in autocomplete: ", e);
  }

  public async provideInlineCompletionItems(
    input: AutocompleteInput,
    token: AbortSignal | undefined,
  ): Promise<AutocompleteOutput | undefined> {
    const { filepath, pos, selectedCompletionInfo, injectDetails } = input;
    const position = pos;
    try {
      const abortController = new AbortController();
      const signal = abortController.signal;
      const document = new DocumentImpl(this.ide, filepath);
      await document.prepare();

      // token.onCancellationRequested(() => abortController.abort());

      // Handle notebook cells
      // const pos = {
      //   line: position.line,
      //   character: position.character,
      // };
      let manuallyPassFileContents: string | undefined = undefined;
      // if (document.uri.scheme === "vscode-notebook-cell") {
      //   const notebook = vscode.workspace.notebookDocuments.find((notebook) =>
      //     notebook
      //       .getCells()
      //       .some((cell) =>
      //         URI.equal(cell.document.uri.toString(), document.uri.toString()),
      //       ),
      //   );
      //   if (notebook) {
      //     const cells = notebook.getCells();
      //     manuallyPassFileContents = cells
      //       .map((cell) => {
      //         const text = cell.document.getText();
      //         if (cell.kind === vscode.NotebookCellKind.Markup) {
      //           return `"""${text}"""`;
      //         } else {
      //           return text;
      //         }
      //       })
      //       .join("\n\n");
      //     for (const cell of cells) {
      //       if (
      //         URI.equal(cell.document.uri.toString(), document.uri.toString())
      //       ) {
      //         break;
      //       } else {
      //         pos.line += cell.document.getText().split("\n").length + 1;
      //       }
      //     }
      //   }
      // }

      // Manually pass file contents for unsaved, untitled files
      if (document.isUntitled) {
        manuallyPassFileContents = document.getText();
      }

      // Handle commit message input box
      let manuallyPassPrefix: string | undefined = undefined;

      const input: AutocompleteInput = {
        isUntitledFile: document.isUntitled,
        completionId: uuidv4(),
        filepath: document.uri.toString(),
        pos,
        recentlyEditedFiles: [],
        recentlyEditedRanges:
          await this.recentlyEditedTracker.getRecentlyEditedRanges(),
        manuallyPassFileContents,
        manuallyPassPrefix,
        selectedCompletionInfo,
        injectDetails,
      };

      // setupStatusBar(undefined, true);
      const outcome =
        await this.completionProvider.provideInlineCompletionItems(
          input,
          signal,
        );

      if (!outcome || !outcome.completion) {
        return null;
      }

      // VS Code displays dependent on selectedCompletionInfo (their docstring below)
      // We should first always make sure we have a valid completion, but if it goes wrong we
      // want telemetry to be correct
      /**
       * Provides information about the currently selected item in the autocomplete widget if it is visible.
       *
       * If set, provided inline completions must extend the text of the selected item
       * and use the same range, otherwise they are not shown as preview.
       * As an example, if the document text is `console.` and the selected item is `.log` replacing the `.` in the document,
       * the inline completion must also replace `.` and start with `.log`, for example `.log()`.
       *
       * Inline completion providers are requested again whenever the selected item changes.
       */
      if (selectedCompletionInfo) {
        outcome.completion = selectedCompletionInfo.text + outcome.completion;
      }
      // const willDisplay = this.willDisplay(
      //   document,
      //   selectedCompletionInfo,
      //   signal,
      //   outcome,
      // );
      // if (!willDisplay) {
      //   return null;
      // }

      // Mark displayed
      this.completionProvider.markDisplayed(input.completionId, outcome);
      this._lastShownCompletion = outcome;

      // Construct the range/text to show
      const startPos = selectedCompletionInfo?.range.start ?? position;
      let range: Range = {
        start: startPos,
        end: startPos,
      };
      let completionText = outcome.completion;
      const isSingleLineCompletion = outcome.completion.split("\n").length <= 1;

      if (isSingleLineCompletion) {
        const lastLineOfCompletionText = completionText.split("\n").pop();
        const currentText = document
          .lineAt(startPos)
          .text.substring(startPos.character);
        const diffs = diffWords(currentText, lastLineOfCompletionText);

        if (diffPatternMatches(diffs, ["+"])) {
          // Just insert, we're already at the end of the line
        } else if (
          diffPatternMatches(diffs, ["+", "="]) ||
          diffPatternMatches(diffs, ["+", "=", "+"])
        ) {
          // The model repeated the text after the cursor to the end of the line
          range = {
            start: startPos,
            end: document.lineAt(startPos).range.end,
          };
        } else if (
          diffPatternMatches(diffs, ["+", "-"]) ||
          diffPatternMatches(diffs, ["-", "+"])
        ) {
          // We are midline and the model just inserted without repeating to the end of the line
          // We want to move the cursor to the end of the line
          // range = new vscode.Range(
          //   startPos,
          //   document.lineAt(startPos).range.end,
          // );
          // // Find the last removed part of the diff
          // const lastRemovedIndex = findLastIndex(
          //   diffs,
          //   (diff) => diff.removed === true,
          // );
          // const lastRemovedContent = diffs[lastRemovedIndex].value;
          // completionText += lastRemovedContent;
        } else {
          // Diff is too complicated, just insert the first added part of the diff
          // This is the safe way to ensure that it is displayed
          if (diffs[0]?.added) {
            completionText = diffs[0].value;
          } else {
            // If the first part of the diff isn't an insertion, then the model is
            // probably rewriting other parts of the line
            return undefined;
          }
        }
      } else {
        // Extend the range to the end of the line for multiline completions
        range = {
          start: startPos,
          end: document.lineAt(startPos).range.end,
        };
      }

      return {
        id: input.completionId,
        text: completionText,
        position: startPos,
        range: range,
        replacingLines: [],
      };

      // const completionItem = new vscode.InlineCompletionItem(
      //   completionText,
      //   range,
      //   {
      //     title: "Log Autocomplete Outcome",
      //     command: "continue.logAutocompleteOutcome",
      //     arguments: [input.completionId, this.completionProvider],
      //   },
      // );

      // (completionItem as any).completeBracketPairs = true;
      // return [completionItem];
    } finally {
    }
  }
}

type DiffPartType = "+" | "-" | "=";

function diffPatternMatches(diffs: Change[], pattern: DiffPartType[]): boolean {
  if (diffs.length !== pattern.length) {
    return false;
  }

  for (let i = 0; i < diffs.length; i++) {
    const diff = diffs[i];
    const diffPartType: DiffPartType =
      !diff.added && !diff.removed ? "=" : diff.added ? "+" : "-";

    if (diffPartType !== pattern[i]) {
      return false;
    }
  }

  return true;
}
