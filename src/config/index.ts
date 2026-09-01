import * as vscode from 'vscode';
import { resolveVariables } from '../utils/variables';

export interface CppReplConfig {
  executablePath: string;
  extraArgs: string[];
  includePaths: string[];
  clearOnRun: boolean;
}

/**
 * Read and normalize extension configuration.
 */
export function getConfig(): CppReplConfig {
  const cfg = vscode.workspace.getConfiguration('cppRepl');
  const executablePath = (cfg.get<string>('executablePath') || 'cpp-repl').trim() || 'cpp-repl';
  const extraArgs = cfg.get<string[]>('extraArgs') || [];
  const includePaths = cfg.get<string[]>('includePaths') || [];
  const clearOnRun = cfg.get<boolean>('clearOnRun') || false;
  return { executablePath, extraArgs, includePaths, clearOnRun };
}

/**
 * Build CLI args for launching cpp-repl from config.
 * Handles variable resolution for each path/arg.
 */
export function buildLaunchArgs(): string[] {
  const { extraArgs, includePaths } = getConfig();
  const args: string[] = [];
  for (const inc of includePaths) {
    if (!inc) {
      continue;
    }
    args.push('-I', resolveVariables(inc));
  }
  for (const arg of extraArgs) {
    args.push(resolveVariables(arg));
  }
  return args;
}

/**
 * Resolve executable path with variable substitution.
 */
export function getExecutablePath(): string {
  return resolveVariables(getConfig().executablePath);
}
