import { ipcMain, WebContents } from "electron";
import { EventEmitter } from "stream";
import { PeerToken } from "./Message";

export interface MessageChannel extends EventEmitter {
  onMessage(messageType: string, handler: (data: any) => void): void;

  sendMessage(messageType: string, data: any): void;

  request(messageType: string, data: any): Promise<any>;

  disconnect(): void;

  get isConnected(): Boolean;
}

export class WebviewChannel extends EventEmitter implements MessageChannel {
  constructor(
    private project: Project,
    private webview: WebContents,
  ) {
    super();
    this.ipcMainHandler = this.ipcMainHandler.bind(this);
    
    this.connect()
  }
   // ipc handler for webview to main process
   private ipcMainHandler(
    event: Electron.IpcMainEvent,
    messageType: string,
    data: any,
    messageId: string,
  ) {
    if (event.frameId == this.webview.id) {
      console.debug("xipc/postToMain", messageType, data, messageId);
      this.emit(messageType, data)
    }
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

  connect(): void {
    ipcMain.on("xipc/postToMain", this.ipcMainHandler);
  }
  disconnect(): void {
    ipcMain.off("xipc/postToMain", this.ipcMainHandler);
  }
  get isConnected(): Boolean {
    throw new Error("Method not implemented.");
  }
}
