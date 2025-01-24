import EventEmitter from "node:events";
import { Socket } from "socket.io";
import {
  ToCoreFromXcodeProtocol,
  ToXcodeFromCoreProtocol,
} from "../messages/XcodeTypes";
import { v4 as uuidv4 } from "uuid";
import { Project, projectIdentifier } from "../project/types";

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

export type SocketChannelType = "inspector" | "extension"

export interface SocketChannelInfo {
  id: string;
  type: SocketChannelType;
}

export interface SocketChannel {
  readonly info: SocketChannelInfo;
  isEqual(other: SocketChannel): Boolean;

  on<T extends keyof ToCoreFromXcodeProtocol>(
    project: Project,
    handler: (
      messageType: keyof ToCoreFromXcodeProtocol,
      message: ToCoreFromXcodeProtocol[T][0],
    ) => Promise<ToCoreFromXcodeProtocol[T][1]> | ToCoreFromXcodeProtocol[T][1],
  ): this;

  request<T extends keyof ToXcodeFromCoreProtocol>(
    project: Project,
    messageType: T,
    data: ToXcodeFromCoreProtocol[T][0],
  ): Promise<ToXcodeFromCoreProtocol[T][1]>;
}

export class SocketChannel implements SocketChannel {
  constructor(
    readonly info: SocketChannelInfo,
    private socket: Socket,
    readonly projectResolver: (project: Project) => Promise<void>,
    readonly timeout: number = 5000,
  ) {
    this.setup();
  }

  isEqual(other: SocketChannel): Boolean {
    return (
      this.info.id === other.info.id &&
      this.info.type === other.info.type
    );
  }

  private projectListeners: Map<
    string,
    (messagetType: string, message: any) => Promise<any> | any
  > = new Map();
  // private listeners: Map<string, (project: Project, message: any) => any> =
  // new Map();
  // on<T extends keyof ToCoreFromXcodeProtocol>(
  //   messageType: T,
  //   handler: (
  //     project: Project | undefined,
  //     message: ToCoreFromXcodeProtocol[T][0],
  //   ) => Promise<ToCoreFromXcodeProtocol[T][1]> | ToCoreFromXcodeProtocol[T][1],
  // ): this {
  //   this.listeners.set(messageType, handler);
  //   return this;
  // }

  on<T extends keyof ToCoreFromXcodeProtocol>(
    project: Project,
    handler: (
      messageType: T,
      message: ToCoreFromXcodeProtocol[T][0],
    ) => Promise<ToCoreFromXcodeProtocol[T][1]> | ToCoreFromXcodeProtocol[T][1],
  ): this {
    this.projectListeners.set(projectIdentifier(project), handler);
    return this;
  }

  request<T extends keyof ToXcodeFromCoreProtocol>(
    project: Project | undefined = undefined,
    messageType: T,
    data: ToXcodeFromCoreProtocol[T][0],
  ): Promise<ToXcodeFromCoreProtocol[T][1]> {
    return new Promise((resolve, reject) => {
      this.socket.timeout(this.timeout).emitWithAck(
        this.encodeEvent(messageType),
        { project, message: data },
        (data: any) => {
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
        console.debug(`[SIPC] sent: (${messageType}) ${JSON.stringify(ret)}`);
        const message = this.successResponse(ret);
        const data = this.encode(message);
        ack(data);
      };

      const [success, messageType] = this.decodeEvent(event);
      if (!success) {
        console.error("[SIPC] invalid event: " + event);
        error({ code: -1, error: "invalid event" });
        return;
      }

      const str = data.toString("utf-8");
      const json = JSON.parse(str);
      const project: Project = json.project;
      const message = json.message;
      console.debug(`[SIPC] received: (${messageType}) ${str}`);

      this.projectResolver(project)
        .then(() => {
          const listener = this.projectListeners.get(projectIdentifier(project));
          // console.log(this, this.projectListeners, listener)
          if (!listener) {
            console.error("[SIPC] no listener for " + JSON.stringify(project));
            error({ code: -1, error: "no listener" });
            return;
          }

          try {
            const ret = listener(messageType, message);
            if (ret instanceof Promise) {
              ret.then((res) => response(res)).catch((e) => error(e));
            } else {
              response(ret);
            }
          } catch (e) {
            console.error("[SIPC] error in listener: " + e.toString());
            error(e);
          }
        })
        .catch((e) => {
          console.error("[SIPC] failed to resolve project: " + JSON.stringify(project));
          error(e);
        });
    });
  }

  disconnect() {
    this.socket.disconnect();
  }

  get isConnected() {
    return this.socket.connected;
  }
}
