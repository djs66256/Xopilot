import { SocketIPCServer } from "../ipc/SocketIPCServer";
import { ProjectContainer } from "./ProjectContainer";
import { Project, projectIdentifier } from "./types";

export class ProjectManager {
  private projects: Map<string, ProjectContainer> = new Map();

  constructor(readonly ipcServer: SocketIPCServer) {}

  destroy() {
    for (const [, project] of this.projects) {
      project.destroy();
    }
  }

  getProjectContainer(project: Project): ProjectContainer {
    const key = projectIdentifier(project)
    let container = this.projects.get(key);
    if (!container) {
      container = new ProjectContainer(project, this.ipcServer);
      this.projects.set(key, container);
    }
    return container;
  }

  deleteProjectContainer(project: Project) {
    this.projects.delete(project.id);
  }
}
