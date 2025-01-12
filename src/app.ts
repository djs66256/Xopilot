import { BrowserWindow } from "electron";
import { SocketIPCServer } from "./core/ipc/SocketIPCServer";
import { ProjectManager } from "./core/project/ProjectManager";
import { emptyProject } from "./core/project/Project";

export class App {
  private projectManager = new ProjectManager()
  constructor(
    private ipcServer = new SocketIPCServer(),
  ) {
  }

  onReady() {
    this.ipcServer.on("connected", (channel) => {
      const project = this.projectManager.getProjectContainer(channel.project)
      project.insepectChannel = channel;
    });
    this.ipcServer.on("disconnected", (channel) => {
      const project = this.projectManager.getProjectContainer(channel.project)
      project.insepectChannel = null;
    });

    const projectContainer = this.projectManager.getProjectContainer(emptyProject)
    projectContainer.openChatBrowserWindow();
  }

  onActivate() {
    if (BrowserWindow.getAllWindows().length === 0) {
      // TODO: MAY open settings window?
      const projectContainer = this.projectManager.getProjectContainer(emptyProject)
      projectContainer.openChatBrowserWindow();
    }
  }

  onWindowAllClosed() {

  }

  onWillQuit() {
    this.projectManager.destroy();
  }
}
