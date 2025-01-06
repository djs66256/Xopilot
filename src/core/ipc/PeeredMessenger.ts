import { InProcessMessenger } from "core/protocol/messenger";
import { PeerToken } from "./Message";
import { MessageChannel, WebviewChannel } from "./MessageChannel";
import { FromCoreProtocol, ToCoreProtocol } from "core/protocol";
import {
  CORE_TO_WEBVIEW_PASS_THROUGH,
  WEBVIEW_TO_CORE_PASS_THROUGH,
} from "core/protocol/passThrough";

export class PeeredMessenger {
  private inProcessMessenger = new InProcessMessenger<
    ToCoreProtocol,
    FromCoreProtocol
  >();

  private _webviewChannel: MessageChannel | null = null;
  constructor(
    // peerToken: PeerToken,
    // private inspector: XCodeInspector,
    // private ide: XCodeIde,
    // private chat: any,
  ) {
    // this.setupWebviewChannel()
  }

  set webviewChannel(webviewChannel: MessageChannel|null) {
    if (this._webviewChannel) {
      this._webviewChannel.disconnect();
    }
    this._webviewChannel = webviewChannel;
    this.setupWebviewChannel();
  }

  private setupWebviewChannel() {
    const channel = this._webviewChannel;
    if (channel) {
      channel.on("getOpenFiles", (data) => {
        console.log("getOpenFiles", data);
      })
      /** PASS THROUGH FROM WEBVIEW TO CORE AND BACK **/
      WEBVIEW_TO_CORE_PASS_THROUGH.forEach((messageType) => {
        channel.on(messageType, async (msg) => {
          console.debug(`[Messenger] webview message type: ${messageType}, data: ${msg}`)
          return await this.inProcessMessenger.externalRequest(
            messageType,
            msg.data,
            msg.messageId,
          );
        });
      });

      /** PASS THROUGH FROM CORE TO WEBVIEW AND BACK **/
      CORE_TO_WEBVIEW_PASS_THROUGH.forEach((messageType) => {
        this.inProcessMessenger.externalOn(messageType, async (msg) => {
          console.debug(`[Messenger] core message type: ${messageType}, data: ${msg}`)
          return await channel.request(messageType, msg.data);
        });
      });
    }
  }
}
