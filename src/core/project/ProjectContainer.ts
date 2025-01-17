import { XcodeIDE } from "../ide/XcodeIDE";
import { ProjectMessenger } from "../messages/ProjectMessenger";
import { Core } from "core/core";
import { InProcessMessenger } from "core/protocol/messenger";
import { FromCoreProtocol, ToCoreProtocol } from "core/protocol";
import { BrowserWindowHost } from "./BrowserWindowHost";
import { IdeChannel } from "../messages/IdeChannel";
import { Project } from "./types";
import { XcodeChannel } from "../messages/XcodeChannel";
import { SocketIPCServer } from "../ipc/SocketIPCServer";
import { CompletionMessenger } from "../autocomplete/CompletionMessenger";
import { TabAutocompleteModel } from "../autocomplete/loadAutocompleteModel";
import { ConfigHandler } from "core/config/ConfigHandler";

export class ProjectContainer {
  private ide: XcodeIDE;

  private configHandler: ConfigHandler;
  private _insepectChannel: MessageChannel | null = null;
  private _chatChannel: MessageChannel | null = null;
  private ideChannel: IdeChannel;
  private inProcessMessenger: InProcessMessenger<
    ToCoreProtocol,
    FromCoreProtocol
  >;
  private tabAutocompleteModel: TabAutocompleteModel;

  private chatWindow: BrowserWindowHost;
  private xcodeChannel: XcodeChannel;
  private messenger: ProjectMessenger;
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
    this.xcodeChannel = new XcodeChannel(
      project,
      this.ipcServer,
      this.inProcessMessenger,
    );
    this.ideChannel = new IdeChannel(project);
    this.ide = new XcodeIDE();
    this.messenger = new ProjectMessenger(
      this.inProcessMessenger,
      this.chatWindow.messageChannel,
      this.ideChannel,
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
    new CompletionMessenger(
      this.project,
      this.configHandler,
      this.ide,
      this.tabAutocompleteModel,
      this.xcodeChannel,
    );
    // } catch (e) {
    //   console.log("Error creating core", e);
    // }
  }

  destroy() {
    this.chatWindow.removeAllListeners();
  }

  set insepectChannel(channel: MessageChannel | null) {}

  get insepectChannel(): MessageChannel | null {
    return this._insepectChannel;
  }

  openChatBrowserWindow(options: { create: Boolean } = { create: true }) {
    return this.chatWindow.open(options);
  }
}
