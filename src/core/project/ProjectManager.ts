

class ProjectManager {
  private static instance: ProjectManager;
  private projects: Map<string, Project> = {};

  private constructor() {
    
  }

  public static getInstance(): ProjectManager {
    if (!ProjectManager.instance) {
      ProjectManager.instance = new ProjectManager();
    }
    return ProjectManager.instance;
  }

  
}