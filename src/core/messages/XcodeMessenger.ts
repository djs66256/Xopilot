import { SocketChannel } from "../ipc/SocketChannel";
import { SocketIPCServer } from "../ipc/SocketIPCServer";
import { ProjectManager } from "../project/ProjectManager";


class XcodeMessenger {
  private channels: [SocketChannel] = []
  constructor(
    private readonly ipcServer: SocketIPCServer,
    private readonly projectManager: ProjectManager,
  ) {
    ipcServer.on("connected", (channel) => {
      this.channels.push(channel);
    });
    ipcServer.on("disconnected", (channel) => {
      const index = this.channels.indexOf(channel);
      if (index !== -1) {
        this.channels.splice(index, 1);
      }
    });
  }

  
}