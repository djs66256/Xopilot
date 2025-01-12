import { AutocompleteInput, AutocompleteOutcome } from "core/autocomplete/util/types"


export type ToCoreFromXcodeProtocol = {
  "autocomplete/request": AutocompleteInput,
  "autocomplete/reject": string,
  "autocomplete/accept": string
}

export type ToXcodeFromCoreProtocol = {
  "autocomplete/suggestions": AutocompleteOutcome
}