import { ToCoreFromIdeOrWebviewProtocol } from "core/protocol/core";
import {
  ToWebviewOrCoreFromIdeProtocol,
  ToIdeFromWebviewOrCoreProtocol,
} from "core/protocol/ide";
import { ToWebviewFromIdeOrCoreProtocol } from "core/protocol/webview";
import { FromWebviewProtocol, ToWebviewProtocol } from "core/protocol";
import { IMessenger, Message } from "core/protocol/messenger";
import { SocketChannel } from "./SocketIPCServer";
import { MessageChannel, WebviewChannel } from "./MessageChannel";
import { PeerToken } from "./Message";
import { ProjectMessenger } from "../messages/ProjectMessenger";

class XCodeInspector {}

class XCodeIde {}

class ChatWebviewProtocol
  implements IMessenger<FromWebviewProtocol, ToWebviewProtocol>
{
  onError(handler: (error: Error) => void): void {
    throw new Error("Method not implemented.");
  }
  send(messageType: string, data: any, messageId?: string): string {
    throw new Error("Method not implemented.");
  }
  on<T extends keyof FromWebviewProtocol>(
    messageType: T,
    handler: (
      message: Message<FromWebviewProtocol[T][0]>,
    ) => FromWebviewProtocol[T][1] | Promise<FromWebviewProtocol[T][1]>,
  ): void {
    throw new Error("Method not implemented.");
  }
  request<T extends keyof ToWebviewProtocol>(
    messageType: T,
    data: ToWebviewProtocol[T][0],
  ): Promise<ToWebviewProtocol[T][1]> {
    throw new Error("Method not implemented.");
  }
  invoke<T extends keyof FromWebviewProtocol>(
    messageType: T,
    data: FromWebviewProtocol[T][0],
    messageId?: string,
  ): FromWebviewProtocol[T][1] {
    throw new Error("Method not implemented.");
  }
}

class SettingsService {}

class SettingsWebview {}

class XCodeMessangerChannel {
  constructor(
    private peerToken: PeerToken,
    private inspector: XCodeInspector,
    private ide: XCodeIde,
    private chat: any,
  ) {}
}

export class XCodeMessenger {
  private peers: Map<PeerToken, ProjectMessenger> = new Map();
  // private settings;

  setChatChannel(peerToken: PeerToken, channel: MessageChannel | null) {
    let peer = this.peers.get(peerToken);
    if (peer) {
      peer.webviewChannel = channel;
    } else {
      if (channel) {
        peer = new ProjectMessenger(peerToken);
        peer.webviewChannel = channel;
        this.peers.set(peerToken, peer);
      }
    }
  }

  postToMain(
    peerToken: PeerToken,
    messageType: string,
    data: any,
    messageId: string,
  ) {
    let peer = this.peers.get(peerToken);
    peer?.webviewChannel?.emit(messageType, data);
  }

  createChannel(channel: SocketChannel) {}

  destroyChannel(channel: SocketChannel) {}

  destroyAll() {}

  onXCodeInspector(message: string, handler: (data: any) => void) {}

  onWebview(message: string, handler: (data: any) => void) {}

  constructor() {}
}
