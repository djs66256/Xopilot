import { ToCoreFromXcodeProtocol, ToXcodeFromCoreProtocol } from "./XcodeTypes";


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
  constructor(private project: Project) {}

  on<T extends keyof ToCoreFromXcodeProtocol>(
    messageType: T,
    handler: (
      message: ToCoreFromXcodeProtocol[T][0],
    ) => Promise<ToCoreFromXcodeProtocol[T][1]> | ToCoreFromXcodeProtocol[T][1],
  ): this {
    this.socket.on(messageType, handler);
  }
}