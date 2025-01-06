import { ProjectContainer } from "./ProjectContainer";


export class ProjectManager {
  private projects: Map<string, ProjectContainer> = new Map();

  constructor() {
    
  }

  destroy() {
    for (const [, project] of this.projects) {
      project.destroy();
    }
  }

  getProjectContainer(project: Project): ProjectContainer {
    let container = this.projects.get(project.id);
    if (!container) {
      container = new ProjectContainer(project);
      this.projects.set(project.id, container);
    }
    return container;
  }

  deleteProjectContainer(project: Project) {
    this.projects.delete(project.id);
  }

}