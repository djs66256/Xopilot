
import { EventEmitter } from "stream";

export interface MessageChannel extends EventEmitter {
  onMessage(messageType: string, handler: (data: any) => void): void;

  sendMessage(messageType: string, data: any): void;

  request(messageType: string, data: any): Promise<any>;

  disconnect(): void;

  get isConnected(): Boolean;
}
