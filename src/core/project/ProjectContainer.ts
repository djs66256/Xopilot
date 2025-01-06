import { XcodeIDE } from "../ide/XcodeIDE";
import { ProjectMessenger } from "../ipc/ProjectMessenger";
import { MessageChannel, WebviewChannel } from "../ipc/MessageChannel";
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

  private chatWindow = new BrowserWindowHost();
  private messenger = new ProjectMessenger();
  private core: Core;

  constructor(project: Project) {
    // this.configHandler = this.core.configHandler;
    // resolveConfigHandler?.(this.configHandler);
    // this.configHandler.loadConfig();
    try {
    this.inProcessMessenger = new InProcessMessenger<
      ToCoreProtocol,
      FromCoreProtocol
    >();
    this.ide = new XcodeIDE();
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

    this.chatWindow.on("create", (window) => {
      const channel = new WebviewChannel(project, window.webContents);
      this.messenger.webviewChannel = channel;
    });
    this.chatWindow.on("close", (window) => {
      this.messenger.webviewChannel = null;
    });
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
