import { FromWebviewProtocol, ToWebviewProtocol } from "core/protocol";
import { Message } from "core/protocol/messenger";
import { ipcMain, WebContents } from "electron";
import { EventEmitter } from "node:events";
import { v4 as uuidv4 } from "uuid";

export class WebviewChannel extends EventEmitter {
  webview: WebContents | null = null;

  constructor(private project: Project) {
    super();
    this.ipcMainHandler = this.ipcMainHandler.bind(this);

    this.connect();
  }

  send(messageType: string, data: any, messageId?: string): string {
    const id = messageId ?? uuidv4();
    this.webview.emit("xipc/postToWebview", messageType, data, id);
    return id;
  }

  invoke<T extends keyof FromWebviewProtocol>(
    messageType: T,
    data: FromWebviewProtocol[T][0],
    messageId?: string,
  ): FromWebviewProtocol[T][1] {
    throw new Error("Method not implemented.");
  }

  onError(handler: (error: Error) => void): void {
    throw new Error("Method not implemented.");
  }

  request<T extends keyof ToWebviewProtocol>(
    messageType: T,
    data: ToWebviewProtocol[T][0],
    retry: boolean = true,
  ): Promise<ToWebviewProtocol[T][1]> {
    const messageId = uuidv4();
    return new Promise(async (resolve, reject) => {
      console.debug("[WEB] request:", messageType, data, messageId);
      if (retry) {
        let i = 0;
        while (!this.webview) {
          if (i >= 10) {
            resolve(undefined);
            return;
          } else {
            await new Promise((res) => setTimeout(res, i >= 5 ? 1000 : 500));
            i++;
          }
        }
      }

      if (this.webview) {
        const dispose = this.onDidReceiveMessage((message) => {
          if (message.messageId === messageId) {
            console.debug("[WEB] response:", messageType, data, messageId);
            resolve(message.data);
            dispose();
          }
        });
        this.send(messageType, data, messageId);
      } else {
        resolve(undefined);
      }
    });
  }

  private onDidReceiveMessage<T extends keyof ToWebviewProtocol>(
    handler: (message: Message<ToWebviewProtocol[T][1]>) => void,
  ): () => void {
    const callback = (messageType: string, data: T, messageId: string) => {
      handler({ messageType, data, messageId });
    };
    this.on("*", callback);
    return () => {
      this.off("*", callback);
    };
  }

  // ipc handler for webview to main process
  private ipcMainHandler(
    event: Electron.IpcMainEvent,
    messageType: string,
    data: any,
    messageId: string,
  ) {
    if (event.frameId == this.webview?.id) {
      console.debug("xipc/postToMain", messageType, data, messageId);
      const message: Message = { messageType, data, messageId };
      this.emit(messageType, message);
      this.emit("*", message);
    }
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
