import { Project } from "./project";


export class ProjectManager {
  private static instance: ProjectManager;
  private projects: Map<string, Project> = new Map();

  constructor() {
    
  }

  createProject(param: {projectId: string, projectName: string}) {
    const project = new Project(param.projectId, param.projectName);
    this.projects.set(param.projectId, project);
  }

}