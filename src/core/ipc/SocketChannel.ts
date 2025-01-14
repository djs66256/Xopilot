import EventEmitter from "node:events";
import { Socket } from "socket.io";
import {
  ToCoreFromXcodeProtocol,
  ToXcodeFromCoreProtocol,
} from "../messages/XcodeTypes";
import { v4 as uuidv4 } from "uuid";

export type SocketChannelEvents = {
  message: {
    messageType: string;
    messageId: string;
    data: any;
  };
};

type Response<T> = {
  code: number;
  error: string | undefined;
  data: T;
};

export interface SocketChannel {
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

export class SocketChannel implements SocketChannel {
  constructor(
    readonly project: Project,
    private socket: Socket,
  ) {
    this.setup();
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
      this.socket.emitWithAck(
        this.encodeEvent(messageType),
        data,
        (data) => {
          const responseJson = this.decode(data);
          if (responseJson.code !== 0) {
            reject(responseJson);
          } else {
            resolve(responseJson.data);
          }
        },
      );
    });
  }

  private encodeEvent(messageType: string) {
    return `xcode:${messageType}`;
  }

  private decodeEvent(event: string): [boolean, string] {
    const prefix = "xcode:";
    return [event.startsWith(prefix), event.replace(prefix, "")];
  }

  private errorResponse(
    code: number,
    error: string | undefined,
  ): Response<undefined> {
    return {
      code,
      error,
      data: undefined,
    };
  }

  private successResponse<T>(data: T): Response<T> {
    return {
      code: 0,
      error: undefined,
      data,
    };
  }

  private decode(data: any) {
    return JSON.parse(data.toString("utf-8"));
  }

  private encode(data: any) {
    return Buffer.from(JSON.stringify(data), "utf-8");
  }

  private setup() {
    this.socket.onAny((event: string, data, ack) => {
      const error = (e: any) => {
        console.error(e);
        const message = this.errorResponse(
          e.code ?? -1,
          e.error ?? e.message ?? "unknow",
        );
        const data = this.encode(message);
        ack(data);
      };

      const response = (ret: any) => {
        const message = this.successResponse(ret);
        const data = this.encode(message);
        ack(data);
      };

      let [success, messageType] = this.decodeEvent(event);
      if (!success) {
        console.error("[SIPC] invalid event: " + event);
        error({ code: -1, error: "invalid event" });
        return;
      }

      const listener = this.listeners.get(messageType);
      if (!listener) {
        console.error("[SIPC] no listener for " + messageType);
        error({ code: -1, error: "no listener" });
        return;
      }

      let str = data.toString("utf-8");
      let json = JSON.parse(str);

      try {
        const ret = listener(json);
        if (ret instanceof Promise) {
          ret.then((res) => response(res)).catch((e) => error(e));
        } else {
          response(ret);
        }
      } catch (e) {
        error(e);
      }
    });
  }

  disconnect() {
    this.socket.disconnect();
  }

  get isConnected() {
    return this.socket.connected;
  }
}
