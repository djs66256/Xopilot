import { BrowserWindow } from "electron";
import { SocketIPCServer } from "./core/ipc/SocketIPCServer";
import { ProjectManager } from "./core/project/ProjectManager";
import { emptyProject } from "./core/project/types";

export class App {
  private projectManager: ProjectManager;
  private ipcServer: SocketIPCServer;
  constructor() {
    this.ipcServer = new SocketIPCServer((project) => {
      return new Promise((resolve) => {
        const prj = this.projectManager.getProjectContainer(project);
        // prj.openChatBrowserWindow();
        resolve();
      });
    });
    this.projectManager = new ProjectManager(this.ipcServer)
  }

  onReady() {
    this.ipcServer.startServer();
    this.ipcServer.on("connected", (channel) => {
      // const project = this.projectManager.getProjectContainer(channel.project);
      // project.insepectChannel = channel;
    });
    this.ipcServer.on("disconnected", (channel) => {
      // const project = this.projectManager.getProjectContainer(channel.project);
      // project.insepectChannel = null;
    });

    // const projectContainer =
    //   this.projectManager.getProjectContainer(emptyProject);
    // projectContainer.openChatBrowserWindow();
  }

  onActivate() {
    if (BrowserWindow.getAllWindows().length === 0) {
      // TODO: MAY open settings window?
      const projectContainer =
        this.projectManager.getProjectContainer(emptyProject);
      projectContainer.openChatBrowserWindow();
    }
  }

  onWindowAllClosed() {}

  onWillQuit() {
    this.projectManager.destroy();
  }
}
