import express from "express";
import http from "node:http";
import { EventEmitter } from "events";
import { Server } from "socket.io";
import { SocketChannel } from "./SocketChannel";

const HOST = "127.0.0.1";
const PORT = 56567;

export type SocketIPCServerEvents = {
  "connected": SocketChannel;
  "disconnected": SocketChannel;
};

export interface SocketIPCServer {
  on<T extends keyof SocketIPCServerEvents>(
    event: T,
    listener: (channel: SocketIPCServerEvents[T]) => void,
  ): this;
  startServer(): void;
}

export class SocketIPCServer extends EventEmitter {
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
      console.debug(`[SIPC] a user connected ${socket.id}`);
      // get the socket identifier
      socket
        .emitWithAck("whoareyou")
        .then((res) => {
          console.debug("[SIPC] whoareyou: " + res);
          const id = res.id as string;
          if (res.type == "inspector" && id) {
            // success connected!
            const project: Project = { id: "xxx", documentUrl: "xxx" };
            const channel = new SocketChannel(project, socket);
            this.channels.set(socket.id, channel);

            this.emit("connected", channel);
          } else {
            console.error("[SIPC] whoareyou error: " + res);
            socket.disconnect();
          }
        })
        .catch((err) => {
          socket.disconnect();
          console.error("[SIPC] whoareyou error: " + err);
        });

      socket.on("disconnect", (reason) => {
        console.debug("[SIPC] socket disconnect: " + reason);
        const channel = this.channels.get(socket.id);
        channel.disconnect();
        this.emit("disconnected", channel);
        this.channels.delete(socket.id);
      });
    });
    this.io.engine.on("connection_error", (error) => {
      console.error("[SIPC] socket connection_error: " + error);
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
