import { BrowserWindow } from "electron";
import { XcodeIDE } from "../ide/XcodeIDE";
import { PeeredMessenger } from "../ipc/PeeredMessenger";
import { MessageChannel, WebviewChannel } from "../ipc/MessageChannel";
import { Core } from "core/core";
import { InProcessMessenger } from "continue/core/protocol/messenger";
import { FromCoreProtocol, ToCoreProtocol } from "continue/core/protocol";
import { BrowserWindowHost } from "./BrowserWindowHost";


export class ProjectContainer {
  private ide = new XcodeIDE();

  private _insepectChannel: MessageChannel | null = null;
  private _chatChannel: MessageChannel | null = null;
  private inProcessMessenger = new InProcessMessenger<
    ToCoreProtocol,
    FromCoreProtocol
  >();

  private chatWindow = new BrowserWindowHost()
  private messenger = new PeeredMessenger();
  core = new Core(this.inProcessMessenger, this.ide, async (log: string) => {
    // outputChannel.appendLine(
    //   "==========================================================================",
    // );
    // outputChannel.appendLine(
    //   "==========================================================================",
    // );
    // outputChannel.append(log);
  });

  constructor(
    project: Project
  ) {
    // this.configHandler = this.core.configHandler;
    // resolveConfigHandler?.(this.configHandler);
    // this.configHandler.loadConfig();
    
    this.chatWindow.on('create', (window)=>{
      const channel = new WebviewChannel(project, window.webContents);
      this.messenger.webviewChannel = channel;
    })
    this.chatWindow.on('close', (window)=>{
      this.messenger.webviewChannel = null;
    })
  }

  destroy() {
    this.chatWindow.removeAllListeners();
  }

  set insepectChannel(channel: MessageChannel | null) {

  }

  get insepectChannel(): MessageChannel | null {
    return this._insepectChannel;
  }

  openChatBrowserWindow(options: {create: Boolean} = {create: true}) {
    return this.chatWindow.open(options);
  }
}
