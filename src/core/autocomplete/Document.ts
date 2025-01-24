import { IDE, Position, Range } from "core";
import { Document, EndOfLine, TextLine } from "./types";
import fs from "node:fs";
import { XcodeIDE } from "../ide/XcodeIDE";
import { XcodeAutocompleteDocument } from "./AutocompleteProtocol";

export class DocumentImpl implements Document {
  private contents: string;
  private textLines: TextLine[];

  fileName: string;
  isUntitled: boolean = false;
  languageId: string = '';
  version: number = 6;
  isDirty: boolean = false;
  isClosed: boolean = false;
  eol: EndOfLine = EndOfLine.LF;
  eolToken: string = "\n";
  get lineCount(): number { return this.textLines.length }

  constructor(
    public readonly ide: IDE,
    public readonly uri: string,
    public readonly data: XcodeAutocompleteDocument
  ) {}

  async prepare() {
    // from url string get file name
    this.fileName = this.uri.split("/").pop();
    this.contents = this.data.content;
    this.textLines = this.contents.split(this.eolToken).map((line, index) => {
      const textLine: TextLine = {
        lineNumber: index,
        text: line,
        range: {
          start: {
            line: index,
            character: 0,
          },
          end: {
            line: index,
            character: line.length,
          },
        },
        rangeIncludingLineBreak: {
          start: {
            line: index,
            character: 0,
          },
          end: {
            line: index,
            character: line.length + 1,
          },
        },
        firstNonWhitespaceCharacterIndex: line.match(/^\s*/)[0].length,
        isEmptyOrWhitespace: line.length === 0,
      };
      return textLine;
    });
  }
  save(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  lineAt(arg: number | Position): TextLine {
    if (typeof arg === "number") {
      const line = arg;
      return this.textLines[line];
    } else {
      const position = arg;
      return this.textLines[position.line];
    }
  }
  // lineAt(position: Position): TextLine {
  //   return this.textLines[position.line];
  // }
  offsetAt(position: Position): number {
    let offset = 0;
    for (let i = 0; i < position.line; i++) {
      offset += this.textLines[i].text.length + 1;
    }
    offset += position.character;
    return offset;
  }
  positionAt(offset: number): Position {
    let position = { line: 0, character: 0 };
    while (offset > 0) {
      const line = this.textLines[position.line];
      if (offset < line.text.length + 1) {
        position.character = offset;
        break;
      } else {
        offset -= line.text.length + 1;
        position.line++;
        position.character = 0
      }
    }
    return position;
  }
  getText(range?: Range): string {
    if (range) {
      const start = this.offsetAt(range.start);
      const end = this.offsetAt(range.end);
      return this.contents.substring(start, end);
    } else {
      return this.contents;
    }
  }
  getWordRangeAtPosition(
    position: Position,
    regex?: RegExp,
  ): Range | undefined {
    throw new Error("Method not implemented.");
  }
  validateRange(range: Range): Range {
    throw new Error("Method not implemented.");
  }
  validatePosition(position: Position): Position {
    throw new Error("Method not implemented.");
  }
}
