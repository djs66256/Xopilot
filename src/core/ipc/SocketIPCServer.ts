import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import { IPCServer } from './types';

export class SocketIPCServer implements IPCServer {
  private app = express();
  private server = http.createServer(this.app);
  private io = new Server(this.server, {
    cors: {
      origin: "127.0.0.1", // 允许所有来源，可以根据需要进行调整
      methods: ["GET", "POST"]
    }
  });
  private port = 56567;

  constructor() {
    this.setupServer()
  }

  private socket?: SocketIO.Socket;

  private setupServer() {
    this.io.on('connection', (socket) => {
      console.debug('[IPC] a user connected');
      this.socket = socket;

      socket.on('disconnect', (reason) => {
        this.socket = undefined;
        console.debug('[IPC] socket disconnect: ' + reason);
      })

      socket.on('message', (msg) => {
        console.log('message: ' + msg);
        // 广播消息给所有连接的客户端
        // io.emit('message', msg);
      });
    });
    this.io.engine.on('connection_error', (error) => {
      console.error('[IPC] socket connection_error: ' + error)
    })
  }

  public startServer() {
    this.server.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }

  public sendMessage(message: string): void {
    console.log('[IPC] sendMessage: ' + message);
    if (this.socket) {
      this.socket.emit('ipc', message);
    }
    // this.io.emit('message', message);
    // this.io.fetchSockets().then((sockets) => {
    //   for (const socket of sockets) {
    //     console.log('[IPC] sendMessage: ' + message);
    //     socket.emit('ipc', message);
    //   }
    // });
  }
}

/*
// 创建 Express 应用
const app = express();
const server = http.createServer(app);

// 创建 Socket.IO 服务器
const io = new Server(server, {
  cors: {
    origin: "127.0.0.1", // 允许所有来源，可以根据需要进行调整
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});


// 启动服务器
const PORT = process.env.PORT || 56567;

export function startServer() {

// 监听连接事件
  io.on('connection', (socket) => {
    console.log('a user connected');
  
    socket.emit("message", "hello")
  
    // 监听自定义事件
    socket.on('message', (msg) => {
      console.log('message: ' + msg);
      // 广播消息给所有连接的客户端
      // io.emit('message', msg);
    });
  
    // 监听断开连接事件
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
*/