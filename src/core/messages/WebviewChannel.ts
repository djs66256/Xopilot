import { FromWebviewProtocol, ToWebviewProtocol } from "core/protocol";
import { Message } from "core/protocol/messenger";
import { ipcMain, WebContents } from "electron";
import { EventEmitter } from "node:events";
import { v4 as uuidv4 } from "uuid";
import { WebviewMessengerResult } from "core/protocol/util";
import { IMessenger } from "core/protocol/messenger";

export class WebviewChannel
  implements IMessenger<FromWebviewProtocol, ToWebviewProtocol>
{
  webview: WebContents | null = null;
  listeners = new Map<
    keyof FromWebviewProtocol,
    ((message: Message) => any)[]
  >();
  requestListeners = new Map<string, (message: Message) => any>();

  constructor(private project: Project) {
    this.ipcMainHandler = this.ipcMainHandler.bind(this);

    this.connect();
  }

  send(messageType: string, data: any, messageId?: string): string {
    const id = messageId ?? uuidv4();

    // if (messageType == "config/getSerializedProfileInfo") {
    //   console.log("===================");
    //   function printTypes(data: any, name: string = "root", depth = 0) {
    //     console.log(`${"  ".repeat(depth)}${name}: ${typeof data}`);
    //     for (const key in data) {
    //       if (typeof data[key] === "object") {
    //         printTypes(data[key], key, depth + 1);
    //       } else {
    //         console.log(`${"  ".repeat(depth + 1)}${key}: ${typeof data[key]}`);
    //       }
    //     }
    //   }
    //   printTypes(data);
    //   console.log("===================");
    // }

    // Electron use structuredClone() which can not contain any function type.
    if (data) {
      data = JSON.parse(JSON.stringify(data));
    }
    this.webview.send("xipc/postToRender", messageType, data, id);
    return id;
  }

  on<T extends keyof FromWebviewProtocol>(
    messageType: T,
    handler: (
      message: Message<FromWebviewProtocol[T][0]>,
    ) => Promise<FromWebviewProtocol[T][1]> | FromWebviewProtocol[T][1],
  ): void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, []);
    }
    this.listeners.get(messageType)?.push(handler);
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
        const dispose = this.onDidReceiveMessage(messageId, (message) => {
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
    messageId: string,
    handler: (message: Message<ToWebviewProtocol[T][1]>) => void,
  ): () => void {
    // const callback = (messageType: string, data: T, messageId: string) => {
    //   handler({ messageType, data, messageId });
    // };
    this.requestListeners.set(messageId, handler);
    return () => {
      this.requestListeners.delete(messageId);
    };
  }

  // ipc handler for webview to main process
  private async ipcMainHandler(
    event: Electron.IpcMainEvent,
    messageType: keyof FromWebviewProtocol,
    data: any,
    messageId: string,
  ) {
    if (event.frameId == this.webview?.id) {
      console.debug("xipc/postToMain", messageType, data, messageId);
      const msg = { messageType, data, messageId };
      // If the message is a response to a request, call the request callback
      const requestCallback = this.requestListeners.get(messageId);
      if (requestCallback) {
        requestCallback(msg);
      } else {
        const respond = (message: WebviewMessengerResult<any>) =>
          this.send(msg.messageType, message, msg.messageId);

        const handlers = this.listeners.get(msg.messageType) || [];
        for (const handler of handlers) {
          try {
            const response = await handler(msg);
            if (
              response &&
              typeof response[Symbol.asyncIterator] === "function"
            ) {
              let next = await response.next();
              while (!next.done) {
                respond(next.value);
                next = await response.next();
              }
              respond({
                done: true,
                content: next.value?.content,
                status: "success",
              });
            } else {
              respond({
                done: true,
                content: response || {},
                status: "success",
              });
            }
          } catch (e: any) {
            respond({ done: true, error: e.message, status: "error" });

            const stringified = JSON.stringify({ msg }, null, 2);
            console.error(
              `Error handling webview message: ${stringified}\n\n${e}`,
            );

            if (
              stringified.includes("llm/streamChat") ||
              stringified.includes("chatDescriber/describe")
            ) {
              // handle these errors in the GUI
              return;
            }

            let message = e.message;
            if (e.cause) {
              //   if (e.cause.name === "ConnectTimeoutError") {
              //     message = `Connection timed out. If you expect it to take a long time to connect, you can increase the timeout in config.json by setting "requestOptions": { "timeout": 10000 }. You can find the full config reference here: https://docs.continue.dev/reference/config`;
              //   } else if (e.cause.code === "ECONNREFUSED") {
              //     message = `Connection was refused. This likely means that there is no server running at the specified URL. If you are running your own server you may need to set the "apiBase" parameter in config.json. For example, you can set up an OpenAI-compatible server like here: https://docs.continue.dev/reference/Model%20Providers/openai#openai-compatible-servers--apis`;
              //   } else {
              //     message = `The request failed with "${e.cause.name}": ${e.cause.message}. If you're having trouble setting up Continue, please see the troubleshooting guide for help.`;
              //   }
              // }
              // if (message.includes("https://proxy-server")) {
              //   message = message.split("\n").filter((l: string) => l !== "")[1];
              //   try {
              //     message = JSON.parse(message).message;
              //   } catch {}
              //   if (message.includes("exceeded")) {
              //     message +=
              //       " To keep using Continue, you can set up a local model or use your own API key.";
              //   }
              //   vscode.window
              //     .showInformationMessage(message, "Add API Key", "Use Local Model")
              //     .then((selection) => {
              //       if (selection === "Add API Key") {
              //         this.request("addApiKey", undefined);
              //       } else if (selection === "Use Local Model") {
              //         this.request("setupLocalConfig", undefined);
              //       }
              //     });
            } else if (message.includes("Please sign in with GitHub")) {
              // showFreeTrialLoginMessage(message, this.reloadConfig, () =>
              //   this.request("openOnboardingCard", undefined),
              // );
            } else {
              // Telemetry.capture(
              //   "webview_protocol_error",
              //   {
              //     messageType: msg.messageType,
              //     errorMsg: message.split("\n\n")[0],
              //     stack: extractMinimalStackTraceInfo(e.stack),
              //   },
              //   false,
              // );
            }
          }
        }
      }
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
