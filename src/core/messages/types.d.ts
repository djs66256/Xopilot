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
