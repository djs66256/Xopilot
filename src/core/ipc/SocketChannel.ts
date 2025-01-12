import EventEmitter from "node:events";
import { Socket } from "socket.io";
import { ToXcodeFromCoreProtocol } from "../messages/XcodeTypes";
import { v4 as uuidv4 } from "uuid"

export type SocketChannelEvents = {
  "message": {
    messageType: string;
    messageId: string;
    data: any;
  };
};

export interface SocketChannel {
  on<T extends keyof SocketChannelEvents>(
    event: T,
    listener: (data: SocketChannelEvents[T]) => void,
  ): this;

  request<T extends keyof ToXcodeFromCoreProtocol>(
    messageType: T,
    data: ToXcodeFromCoreProtocol[T][0],
  ): Promise<ToXcodeFromCoreProtocol[T][1]>;
}

export class SocketChannel extends EventEmitter implements SocketChannel {
  constructor(
    readonly project: Project,
    private socket: Socket,
  ) {
    super();

    socket.on("message", (messageType, messageId, data) => {
      const ack = this.receiveMessage(messageType, messageId, data);
      if (ack) {

      }
    });
  }

  private receiveMessage(messageType: string, messageId: string, data: any): any {
    this.emit("message", { messageType, messageId, data });
  }

  private send(messageType: string, data: any, messageId?: string): Promise<any> {
    const id = messageId || uuidv4();
    return this.socket.emitWithAck("message", { messageType, data, messageId: id });
  }

  request<T extends keyof ToXcodeFromCoreProtocol>(
    messageType: T,
    data: ToXcodeFromCoreProtocol[T][0],
  ): Promise<ToXcodeFromCoreProtocol[T][1]> {
    return this.send(messageType, data)
  }

  disconnect() {
    this.socket.disconnect();
  }

  get isConnected() {
    return this.socket.connected;
  }
}
