import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Resolve VS Code variable substitutions in a string.
 * Supports ${workspaceFolder}, ${workspaceRoot}, ${file}, ${fileDirname}.
 */
export function resolveVariables(input: string): string {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (workspaceFolder) {
    input = input.replace(/\$\{workspaceFolder\}/g, workspaceFolder);
    input = input.replace(/\$\{workspaceRoot\}/g, workspaceFolder);
  }
  const activeFile = vscode.window.activeTextEditor?.document.uri.fsPath;
  if (activeFile) {
    input = input.replace(/\$\{file\}/g, activeFile);
    input = input.replace(/\$\{fileDirname\}/g, path.dirname(activeFile));
  }
  return input;
}
