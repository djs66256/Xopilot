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
    let container = this.projects.get(projectIdentifier(project));
    if (!container) {
      container = new ProjectContainer(project, this.ipcServer);
      this.projects.set(project.id, container);
    }
    return container;
  }

  deleteProjectContainer(project: Project) {
    this.projects.delete(project.id);
  }
}
