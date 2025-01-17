import { XcodeIDE } from "../ide/XcodeIDE";
import { TabAutocompleteModel } from "./loadAutocompleteModel";
import { XcodeCompletionProvider } from './CompletionProvider'


class XcodeCompletionController {
  private readonly ide: XcodeIDE;
  private readonly completionProvider: XcodeCompletionProvider;
  private readonly tabAutocompleteModel: TabAutocompleteModel;
  
  constructor(
    private readonly configHandler: ConfigHandler,
    ide: XcodeIDE,
    tabAutocompleteModel: TabAutocompleteModel,
    webviewProtocol: XcodeWebviewProtocol,
  )
}