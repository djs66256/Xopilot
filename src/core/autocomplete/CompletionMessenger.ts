import { XcodeIDE } from "../ide/XcodeIDE";
import { TabAutocompleteModel } from "./loadAutocompleteModel";
import { XcodeCompletionProvider } from "./CompletionProvider";
import { XcodeChannel } from "../messages/XcodeChannel";
import { ConfigHandler } from "core/config/ConfigHandler";
import { Project } from "../project/types";

export class CompletionMessenger {
  private readonly completionProvider: XcodeCompletionProvider;
  private abortController: AbortController | undefined;

  constructor(
    private readonly project: Project,
    private readonly configHandler: ConfigHandler,
    private readonly ide: XcodeIDE,
    private readonly tabAutocompleteModel: TabAutocompleteModel,
    private readonly inspectorChannel: XcodeChannel,
  ) {
    this.completionProvider = new XcodeCompletionProvider(
      this.project,
      this.configHandler,
      this.ide,
      this.inspectorChannel,
      this.tabAutocompleteModel,
    );

    inspectorChannel.on("autocomplete/getSuggestion", async (data) => {
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = undefined;
      }
      this.abortController = new AbortController();
      
      let result = await this.completionProvider.provideInlineCompletionItems(
        data,
        this.abortController.signal,
      );
      return result;
    });

    inspectorChannel.on("autocomplete/accept", async (data) => {
      await this.completionProvider.acceptCompletion(data);
    });
  }
}
