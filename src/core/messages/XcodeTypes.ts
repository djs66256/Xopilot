import { AutocompleteInput, AutocompleteOutcome } from "core/autocomplete/util/types"


export type ToCoreFromXcodeProtocol = {
  "autocomplete/complete": [AutocompleteInput, string[]];
  "autocomplete/request": [AutocompleteInput, AutocompleteOutcome];
  "autocomplete/reject": [string, void];
  "autocomplete/accept": [string, void];
}

export type ToXcodeFromCoreProtocol = {
  "autocomplete/suggestions": [AutocompleteOutcome, void];
}