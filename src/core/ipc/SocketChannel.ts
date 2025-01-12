import EventEmitter from "node:events";
import { Socket } from "socket.io";


export class SocketChannel extends EventEmitter  {
  constructor(
    private project: Project,
    private socket: Socket,
  ) {
    super();
  }
  onMessage(messageType: string, handler: (data: any) => void): void {
    throw new Error("Method not implemented.");
  }

  sendMessage(messageType: string, data: any) {
    this.socket.emit("message", { messageType, data });
  }

  async invoke(event: string, data: any) {
    return await this.socket.emitWithAck(event, data);
  }

  async request(messageType: string, data: any) {
    return await this.socket.emitWithAck("message", { messageType, data });
  }

  disconnect() {
    this.socket.disconnect();
  }

  get isConnected() {
    return this.socket.connected;
  }
}