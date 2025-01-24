import { XcodeIDE } from "../ide/XcodeIDE";
import { ProjectMessenger } from "../messages/ProjectMessenger";
import { Core } from "core/core";
import { InProcessMessenger } from "core/protocol/messenger";
import { FromCoreProtocol, ToCoreProtocol } from "core/protocol";
import { BrowserWindowHost } from "./BrowserWindowHost";
import { Project } from "./types";
import { XcodeChannel } from "../messages/XcodeChannel";
import { SocketIPCServer } from "../ipc/SocketIPCServer";
import { CompletionMessenger } from "../autocomplete/CompletionMessenger";
import { TabAutocompleteModel } from "../autocomplete/loadAutocompleteModel";
import { ConfigHandler } from "core/config/ConfigHandler";

export class ProjectContainer {
  private configHandler: ConfigHandler;
  
  private inProcessMessenger: InProcessMessenger<
    ToCoreProtocol,
    FromCoreProtocol
  >;
  private completionMessenger: CompletionMessenger;
  private tabAutocompleteModel: TabAutocompleteModel;

  private chatWindow: BrowserWindowHost;
  private inspectorChannel: XcodeChannel;
  private messenger: ProjectMessenger;
  private ide: XcodeIDE;
  private core: Core;

  constructor(
    readonly project: Project,
    readonly ipcServer: SocketIPCServer,
  ) {
    // this.configHandler = this.core.configHandler;
    // resolveConfigHandler?.(this.configHandler);
    // this.configHandler.loadConfig();
    // try {
    this.chatWindow = new BrowserWindowHost(project);
    this.inProcessMessenger = new InProcessMessenger<
      ToCoreProtocol,
      FromCoreProtocol
    >();
    this.inspectorChannel = new XcodeChannel(
      project,
      this.ipcServer,
      this.inProcessMessenger,
    );
    this.ide = new XcodeIDE(this.inspectorChannel);
    this.messenger = new ProjectMessenger(
      this.inProcessMessenger,
      this.chatWindow.messageChannel,
      this.inspectorChannel,
      this.ide,
    );
    this.core = new Core(
      this.inProcessMessenger,
      this.ide,
      async (log: string) => {
        // outputChannel.appendLine(
        //   "==========================================================================",
        // );
        // outputChannel.appendLine(
        //   "==========================================================================",
        // );
        // outputChannel.append(log);
      },
    );
    this.configHandler = this.core.configHandler;
    this.tabAutocompleteModel = new TabAutocompleteModel(this.configHandler);
    this.completionMessenger = new CompletionMessenger(
      this.project,
      this.configHandler,
      this.ide,
      this.tabAutocompleteModel,
      this.inspectorChannel,
    );
    // } catch (e) {
    //   console.log("Error creating core", e);
    // }

    this.openChatBrowserWindow();
  }

  destroy() {
    this.chatWindow.removeAllListeners();
  }

  openChatBrowserWindow(options: { create: Boolean } = { create: true }) {
    return this.chatWindow.open(options);
  }
}
