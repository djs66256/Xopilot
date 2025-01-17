import { AutocompleteInput, AutocompleteOutcome } from "core/autocomplete/util/types"
import { AutocompleteOutput } from "../autocomplete/types";


export type ToCoreFromXcodeProtocol = {
  "autocomplete/complete": [AutocompleteInput, AutocompleteOutput];
  "autocomplete/request": [AutocompleteInput, AutocompleteOutcome];
  "autocomplete/reject": [string, void];
  "autocomplete/accept": [string, void];
}

export type ToXcodeFromCoreProtocol = {
  "autocomplete/suggestions": [AutocompleteOutcome, void];
}