import { XcodeIDE } from "../ide/XcodeIDE";
import { ProjectMessenger } from "../messages/ProjectMessenger";
import { Core } from "core/core";
import { InProcessMessenger } from "core/protocol/messenger";
import { FromCoreProtocol, ToCoreProtocol } from "core/protocol";
import { BrowserWindowHost } from "./BrowserWindowHost";

export class ProjectContainer {
  private ide: XcodeIDE;

  private _insepectChannel: MessageChannel | null = null;
  private _chatChannel: MessageChannel | null = null;
  private inProcessMessenger: InProcessMessenger<
    ToCoreProtocol,
    FromCoreProtocol
  >;

  private chatWindow: BrowserWindowHost;
  private messenger: ProjectMessenger;
  private core: Core;

  constructor(project: Project) {
    // this.configHandler = this.core.configHandler;
    // resolveConfigHandler?.(this.configHandler);
    // this.configHandler.loadConfig();
    try {
      this.chatWindow = new BrowserWindowHost(project);
      this.inProcessMessenger = new InProcessMessenger<
        ToCoreProtocol,
        FromCoreProtocol
      >();
      this.ide = new XcodeIDE();
      this.messenger = new ProjectMessenger(
        this.inProcessMessenger,
        this.chatWindow.messageChannel,
        this.ide
      )
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
    } catch (e) {
      console.log("Error creating core", e);
    }

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
