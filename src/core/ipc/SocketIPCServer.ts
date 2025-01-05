import express from "express";
import http from "node:http";
import { Server, Socket } from "socket.io";
import { IPCServer } from "./types";
import { EventEmitter } from "node:stream";
import { MessageChannel as IPCMessageChannel } from "./MessageChannel";
import { PeerToken } from "./Message";

const HOST = "127.0.0.1";
const PORT = 56567;

export class SocketChannel implements IPCMessageChannel {
  constructor(
    private token: PeerToken,
    private socket: Socket,
  ) {}
  on(event: string, listener: (...args: any[]) => void): this {
    this.socket.on(event, listener);
    return this;
  }

  onMessage(messageType: string, handler: (data: any) => void) {
    this.socket.on("message", (data) => {
      if (data.messageType == messageType) {
        handler(data);
      }
    });
  }

  send(event: string, data: any) {
    this.socket.emit(event, data);
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

export class SocketIPCServer extends EventEmitter implements IPCServer {
  private app = express();
  private server = http.createServer(this.app);
  private io = new Server(this.server, {
    cors: {
      origin: HOST,
      methods: ["GET", "POST"],
    },
  });
  private port = PORT;
  private channels = new Map<string, SocketChannel>();

  constructor() {
    super();
    this.setupServer();
  }

  private setupServer() {
    this.io.on("connection", (socket) => {
      console.debug(`[IPC] a user connected ${socket.id}`);
      // get the socket identifier
      socket
        .emitWithAck("whoareyou")
        .then((res) => {
          console.debug("[IPC] whoareyou: " + res);
          const id = res.id as string;
          if (res.type == "inspector" && id) {
            // success connected!
            const token = { type: "inspector", id } as PeerToken;
            const channel = new SocketChannel(token, socket);
            this.channels.set(socket.id, channel);

            this.emit("connected", channel);
          } else {
            console.error("[IPC] whoareyou error: " + res);
            socket.disconnect();
          }
        })
        .catch((err) => {
          socket.disconnect();
          console.error("[IPC] whoareyou error: " + err);
        });

      socket.on("disconnect", (reason) => {
        console.debug("[IPC] socket disconnect: " + reason);
        const channel = this.channels.get(socket.id);
        channel.disconnect();
        this.emit("disconnected", channel);
        this.channels.delete(socket.id);
      });
    });
    this.io.engine.on("connection_error", (error) => {
      console.error("[IPC] socket connection_error: " + error);
    });
  }

  public startServer() {
    this.server.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }

  public sendMessage(message: string): void {
    console.log("[IPC] sendMessage: " + message);
    this.io.sockets.emit("ipc", message);
  }
}
