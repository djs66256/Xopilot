export type Project = {
  id: string;
  documentUrl: string;
}

export function projectIdentifier(project: Project) {
  return `${project.id}:${project.documentUrl}`;
}

export const emptyProject: Project = {
  id: "-1",
  documentUrl: "/",
};