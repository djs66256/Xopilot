import { Position, Range } from "core";
import { AutocompleteInput } from "core/autocomplete/util/types";


/*
   public var content: String
    /// Every line has a trailing newline character.
    public var lines: [String]
    public var uti: String
    public var cursorPosition: CursorPosition
    public var cursorOffset: Int
    public var selections: [Selection]
    public var tabSize: Int
    public var indentSize: Int
    public var usesTabsForIndentation: Bool
*/

export interface XcodeAutocompleteDocument {
    content: string;
    lines: string[];
    uti: string;
    cursorPosition: Position;
    cursorOffset: number;
    selections: Range[];
    tabSize: number;
}

export interface XcodeAutocompleteInput extends AutocompleteInput {
  document: XcodeAutocompleteDocument;
}

export interface XcodeAutocompleteOutput {
  id: string;
  text: string;
  position: Position;
  range: Range;
  replacingLines: string[];
}


export type AutocompleteFromXcodeToCoreProtocol = {
    "autocomplete/getSuggestion": [XcodeAutocompleteInput, XcodeAutocompleteOutput];
}