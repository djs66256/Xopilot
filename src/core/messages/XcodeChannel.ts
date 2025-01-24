import { InProcessMessenger } from "core/protocol/messenger";
import { SocketChannel } from "../ipc/SocketChannel";
import { SocketIPCServer } from "../ipc/SocketIPCServer";
import { Project } from "../project/types";
import { ToCoreFromXcodeProtocol, ToXcodeFromCoreProtocol } from "./XcodeTypes";
import { FromCoreProtocol, ToCoreProtocol } from "core/protocol";

export interface XcodeChannel {
  on<T extends keyof ToCoreFromXcodeProtocol>(
    messageType: T,
    handler: (
      message: ToCoreFromXcodeProtocol[T][0],
    ) => Promise<ToCoreFromXcodeProtocol[T][1]> | ToCoreFromXcodeProtocol[T][1],
  ): this;

  request<T extends keyof ToXcodeFromCoreProtocol>(
    messageType: T,
    data: ToXcodeFromCoreProtocol[T][0],
  ): Promise<ToXcodeFromCoreProtocol[T][1]>;
}

export class XcodeChannel implements XcodeChannel {
  socketChannel: SocketChannel;
  constructor(
    private readonly project: Project,
    private readonly ipcServer: SocketIPCServer,
    private readonly inProcessMessenger: InProcessMessenger<
      ToCoreProtocol,
      FromCoreProtocol
    >,
  ) {
    this.socketChannel = ipcServer.inspectorChannel;
    this.ipcServer.on("connected", (channel) => {
      if (channel.info.type == "inspector") {
        this.socketChannel = channel;
        this.setupInspectorChannel();
      }
    });
    this.ipcServer.on("disconnected", (channel) => {
      if (channel.isEqual(this.socketChannel)) {
        this.socketChannel = null;
      }
    });

    this.setupInspectorChannel();
  }

  private setupInspectorChannel() {
    if (!this.socketChannel) {
      return;
    }
    this.socketChannel.on(this.project, (messageType, message) => {
      const handler = this.listeners.get(messageType);
      if (handler) {
        return handler(message);
      } else {
        // Just pass the message through to the in-process messenger
        return this.inProcessMessenger.externalRequest(
          messageType as any,
          message as any,
        );
      }
    });
  }

  private listeners: Map<string, (message: any) => any> = new Map();

  on<T extends keyof ToCoreFromXcodeProtocol>(
    messageType: T,
    handler: (
      message: ToCoreFromXcodeProtocol[T][0],
    ) => Promise<ToCoreFromXcodeProtocol[T][1]> | ToCoreFromXcodeProtocol[T][1],
  ): this {
    this.listeners.set(messageType, handler);
    return this;
  }

  request<T extends keyof ToXcodeFromCoreProtocol>(
    messageType: T,
    data: ToXcodeFromCoreProtocol[T][0],
  ): Promise<ToXcodeFromCoreProtocol[T][1]> {
    return new Promise((resolve, reject) => {
      this.socketChannel
        .request(this.project, messageType, data)
        .then(resolve)
        .catch(reject);
    });
  }
}
