import { ipcMain, WebContents } from "electron";
import { EventEmitter } from "stream";
import { PeerToken } from "./Message";

export interface MessageChannel {
  onMessage(messageType: string, handler: (data: any) => void): void;

  sendMessage(messageType: string, data: any): void;

  request(messageType: string, data: any): Promise<any>;

  disconnect(): void;

  get isConnected(): Boolean;
}

export class WebviewChannel extends EventEmitter implements MessageChannel {
  constructor(
    private peerToken: PeerToken,
    private webview?: WebContents,
  ) {
    super();
    ipcMain.on("xipc/postToMain", this.ipcMainHandler);
  }
   // ipc handler for webview to main process
   private ipcMainHandler(
    event: Electron.IpcMainEvent,
    messageType: string,
    data: any,
    messageId: string,
  ) {
    console.debug("xipc/postToMain", messageType, data, messageId);
    const id = event.frameId;
    const peerToken = this.peerTokens.get(id);
    if (!peerToken) {
      console.error("no peer token for frameId", id);
      return;
    }
    this.messagenger.postToMain(peerToken, messageType, data, messageId);
  }

  onMessage(messageType: string, handler: (data: any) => void): void {
    this.on(messageType, handler);
  }
  send(event: string, data: any): void {
    throw new Error("Method not implemented.");
  }
  sendMessage(messageType: string, data: any): void {
    throw new Error("Method not implemented.");
  }
  invoke(event: string, data: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  request(messageType: string, data: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  disconnect(): void {
    throw new Error("Method not implemented.");
  }
  get isConnected(): Boolean {
    throw new Error("Method not implemented.");
  }
}
