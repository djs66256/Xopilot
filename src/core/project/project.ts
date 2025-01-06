
import { XcodeIDE } from './ide/XcodeIDE';

class Project {

  private ide = new XcodeIDE();
  constructor(
    public readonly id: string,
    public readonly workspaceDir: string,
  ) {
    
  }
}