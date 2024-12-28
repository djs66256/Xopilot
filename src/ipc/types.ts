
export interface IPCServer {
  startServer(): void;

  sendMessage(message: string): void;
}