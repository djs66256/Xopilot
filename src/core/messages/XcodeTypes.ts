import {
  AutocompleteInput,
  AutocompleteOutcome,
} from "core/autocomplete/util/types";
import { AutocompleteFromXcodeToCoreProtocol } from "../autocomplete/AutocompleteProtocol";
import {
  IDEFromCoreToXcodeProtocol,
  IDEFromXcodeToCoreProtocol,
} from "../ide/XcodeIDEProtocol";

export type ToCoreFromXcodeProtocol = AutocompleteFromXcodeToCoreProtocol &
  IDEFromXcodeToCoreProtocol & {};

export type ToXcodeFromCoreProtocol = AutocompleteFromXcodeToCoreProtocol & IDEFromCoreToXcodeProtocol & {};
