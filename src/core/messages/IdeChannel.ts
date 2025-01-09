import EventEmitter from "node:events";
import { v4 as uuidv4 } from "uuid";
import { FromIdeProtocol, ToIdeProtocol } from "core/protocol";
import { Message } from "core/protocol/messenger";

export class IdeChannel extends EventEmitter implements IdeChannel {

  constructor(
    private readonly project: Project
  ) {
    super();
  }
  
  send(messageType: string, data: any, messageId?: string): string {
    const id = messageId ?? uuidv4();

    return id
  }

  invoke<T extends keyof FromIdeProtocol>(
    messageType: T,
    data: FromIdeProtocol[T][0],
    messageId?: string,
  ): FromIdeProtocol[T][1] {
    throw new Error("Method not implemented.");
  }

  onError(handler: (error: Error) => void): void {

  }

  request<T extends keyof ToIdeProtocol>(
    messageType: T,
    data: ToIdeProtocol[T][0],
    retry: boolean = true,
  ): Promise<ToIdeProtocol[T][1]> {
    
  }
}