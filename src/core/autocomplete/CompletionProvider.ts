import { BracketMatchingService } from "core/autocomplete/filtering/BracketMatchingService";
import { IDE } from "core";
import AutocompleteLruCache from "core/autocomplete/util/AutocompleteLruCache";
import { AutocompleteDebouncer } from "core/autocomplete/util/AutocompleteDebouncer";
import { CompletionStreamer } from "core/autocomplete/generation/CompletionStreamer";
import { ContextRetrievalService } from "core/autocomplete/context/ContextRetrievalService";
import { AutocompleteLoggingService } from "core/autocomplete/util/AutocompleteLoggingService";
import { XcodeChannel } from "../messages/XcodeChannel";
import { ConfigHandler } from "core/config/ConfigHandler";
import { TabAutocompleteModel } from "./loadAutocompleteModel";
import { getDefinitionsFromLsp } from "./lsp";

class CompletionProvider {
  private autocompleteCache = AutocompleteLruCache.get();
  public errorsShown: Set<string> = new Set();
  private bracketMatchingService = new BracketMatchingService();
  private debouncer = new AutocompleteDebouncer();
  private completionStreamer: CompletionStreamer;
  private loggingService = new AutocompleteLoggingService();
  private contextRetrievalService: ContextRetrievalService;
  private completionProvider: CompletionProvider;

  constructor(
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
    this.completionStreamer = new CompletionStreamer(this.onError.bind(this));
    this.contextRetrievalService = new ContextRetrievalService(this.ide);
  }

  private onError(e: any) {
    console.error("Error in autocomplete: ", e);
  }
}