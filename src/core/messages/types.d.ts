import { FromIdeProtocol, ToIdeProtocol } from "core/protocol";


interface WebviewChannel implements IMessenger<FromWebviewProtocol, ToWebviewProtocol> {

  send(messageType: string, data: any, messageId?: string): string;

  on<T extends keyof FromWebviewProtocol>(
    messageType: T,
    handler: (
      message: Message<FromWebviewProtocol[T][0]>,
    ) => Promise<FromWebviewProtocol[T][1]> | FromWebviewProtocol[T][1],
  ): void

  invoke<T extends keyof FromWebviewProtocol>(
    messageType: T,
    data: FromWebviewProtocol[T][0],
    messageId?: string,
  ): FromWebviewProtocol[T][1]

  onError(handler: (error: Error) => void): void

  request<T extends keyof ToWebviewProtocol>(
    messageType: T,
    data: ToWebviewProtocol[T][0],
    retry: boolean = true,
  ): Promise<ToWebviewProtocol[T][1]>
}

interface IdeChannel implements IMessenger<FromIdeProtocol, ToIdeProtocol> {
  
  send(messageType: string, data: any, messageId?: string): string;

  on<T extends keyof FromIdeProtocol>(
    messageType: T,
    handler: (
      message: Message<FromIdeProtocol[T][0]>,
    ) => Promise<FromIdeProtocol[T][1]> | FromIdeProtocol[T][1],
  ): void

  invoke<T extends keyof FromIdeProtocol>(
    messageType: T,
    data: FromIdeProtocol[T][0],
    messageId?: string,
  ): FromIdeProtocol[T][1]

  onError(handler: (error: Error) => void): void

  request<T extends keyof ToIdeProtocol>(
    messageType: T,
    data: ToIdeProtocol[T][0],
    retry: boolean = true,
  ): Promise<ToIdeProtocol[T][1]>
}