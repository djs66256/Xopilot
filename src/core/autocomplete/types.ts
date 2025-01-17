import { Position } from "core";

export enum EndOfLine {
  /**
   * The line feed `\n` character.
   */
  LF = 1,
  /**
   * The carriage return line feed `\r\n` sequence.
   */
  CRLF = 2,
}

/**
 * Represents a line of text, such as a line of source code.
 *
 * TextLine objects are __immutable__. When a {@link TextDocument document} changes,
 * previously retrieved lines will not represent the latest state.
 */
export interface TextLine {
  /**
   * The zero-based line number.
   */
  readonly lineNumber: number;

  /**
   * The text of this line without the line separator characters.
   */
  readonly text: string;

  /**
   * The range this line covers without the line separator characters.
   */
  readonly range: Range;

  /**
   * The range this line covers with the line separator characters.
   */
  readonly rangeIncludingLineBreak: Range;

  /**
   * The offset of the first character which is not a whitespace character as defined
   * by `/\s/`. **Note** that if a line is all whitespace the length of the line is returned.
   */
  readonly firstNonWhitespaceCharacterIndex: number;

  /**
   * Whether this line is whitespace only, shorthand
   * for {@link TextLine.firstNonWhitespaceCharacterIndex} === {@link TextLine.text TextLine.text.length}.
   */
  readonly isEmptyOrWhitespace: boolean;
}

export interface Document {
  /**
   * The associated uri for this document.
   *
   * *Note* that most documents use the `file`-scheme, which means they are files on disk. However, **not** all documents are
   * saved on disk and therefore the `scheme` must be checked before trying to access the underlying file or siblings on disk.
   *
   * @see {@link FileSystemProvider}
   * @see {@link TextDocumentContentProvider}
   */
  readonly uri: string;

  /**
   * The file system path of the associated resource. Shorthand
   * notation for {@link TextDocument.uri TextDocument.uri.fsPath}. Independent of the uri scheme.
   */
  readonly fileName: string;

  /**
   * Is this document representing an untitled file which has never been saved yet. *Note* that
   * this does not mean the document will be saved to disk, use {@linkcode Uri.scheme}
   * to figure out where a document will be {@link FileSystemProvider saved}, e.g. `file`, `ftp` etc.
   */
  readonly isUntitled: boolean;

  /**
   * The identifier of the language associated with this document.
   */
  readonly languageId: string;

  /**
   * The version number of this document (it will strictly increase after each
   * change, including undo/redo).
   */
  readonly version: number;

  /**
   * `true` if there are unpersisted changes.
   */
  readonly isDirty: boolean;

  /**
   * `true` if the document has been closed. A closed document isn't synchronized anymore
   * and won't be re-used when the same resource is opened again.
   */
  readonly isClosed: boolean;

  /**
   * Save the underlying file.
   *
   * @return A promise that will resolve to `true` when the file
   * has been saved. If the save failed, will return `false`.
   */
  save(): Promise<boolean>;

  /**
   * The {@link EndOfLine end of line} sequence that is predominately
   * used in this document.
   */
  readonly eol: EndOfLine;

  /**
   * The number of lines in this document.
   */
  readonly lineCount: number;

  /**
   * Returns a text line denoted by the line number. Note
   * that the returned object is *not* live and changes to the
   * document are not reflected.
   *
   * @param line A line number in [0, lineCount).
   * @return A {@link TextLine line}.
   */
  lineAt(line: number): TextLine;

  /**
   * Returns a text line denoted by the position. Note
   * that the returned object is *not* live and changes to the
   * document are not reflected.
   *
   * The position will be {@link TextDocument.validatePosition adjusted}.
   *
   * @see {@link TextDocument.lineAt}
   *
   * @param position A position.
   * @return A {@link TextLine line}.
   */
  lineAt(position: Position): TextLine;

  /**
   * Converts the position to a zero-based offset.
   *
   * The position will be {@link TextDocument.validatePosition adjusted}.
   *
   * @param position A position.
   * @return A valid zero-based offset.
   */
  offsetAt(position: Position): number;

  /**
   * Converts a zero-based offset to a position.
   *
   * @param offset A zero-based offset.
   * @return A valid {@link Position}.
   */
  positionAt(offset: number): Position;

  /**
   * Get the text of this document. A substring can be retrieved by providing
   * a range. The range will be {@link TextDocument.validateRange adjusted}.
   *
   * @param range Include only the text included by the range.
   * @return The text inside the provided range or the entire text.
   */
  getText(range?: Range): string;

  /**
   * Get a word-range at the given position. By default words are defined by
   * common separators, like space, -, _, etc. In addition, per language custom
   * [word definitions} can be defined. It
   * is also possible to provide a custom regular expression.
   *
   * * *Note 1:* A custom regular expression must not match the empty string and
   * if it does, it will be ignored.
   * * *Note 2:* A custom regular expression will fail to match multiline strings
   * and in the name of speed regular expressions should not match words with
   * spaces. Use {@linkcode TextLine.text} for more complex, non-wordy, scenarios.
   *
   * The position will be {@link TextDocument.validatePosition adjusted}.
   *
   * @param position A position.
   * @param regex Optional regular expression that describes what a word is.
   * @return A range spanning a word, or `undefined`.
   */
  getWordRangeAtPosition(position: Position, regex?: RegExp): Range | undefined;

  /**
   * Ensure a range is completely contained in this document.
   *
   * @param range A range.
   * @return The given range or a new, adjusted range.
   */
  validateRange(range: Range): Range;

  /**
   * Ensure a position is contained in the range of this document.
   *
   * @param position A position.
   * @return The given position or a new, adjusted position.
   */
  validatePosition(position: Position): Position;
}
