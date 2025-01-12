import { BracketMatchingService } from "core/autocomplete/filtering/BracketMatchingService";
import { IDE } from "core";
import AutocompleteLruCache from "core/autocomplete/util/AutocompleteLruCache";
import { AutocompleteDebouncer } from "core/autocomplete/util/AutocompleteDebouncer";
import { CompletionStreamer } from "core/autocomplete/generation/CompletionStreamer";
import { ContextRetrievalService } from "core/autocomplete/context/ContextRetrievalService";
import { AutocompleteLoggingService } from "core/autocomplete/util/AutocompleteLoggingService";
import { IdeChannel } from "../messages/IdeChannel";


class CompletionProvider {
  private autocompleteCache = AutocompleteLruCache.get();
  public errorsShown: Set<string> = new Set();
  private bracketMatchingService = new BracketMatchingService();
  private debouncer = new AutocompleteDebouncer();
  private completionStreamer: CompletionStreamer;
  private loggingService = new AutocompleteLoggingService();
  private contextRetrievalService: ContextRetrievalService;

  constructor(
    // private readonly configHandler: ConfigHandler,
    private readonly ideChannel: IdeChannel,
    private readonly ide: IDE,
  ) {
    this.completionStreamer = new CompletionStreamer(this.onError.bind(this));
    this.contextRetrievalService = new ContextRetrievalService(this.ide);
  }
}