import * as vscode from 'vscode';

let channel: vscode.OutputChannel | undefined;

export function getLogger(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel('C++ REPL');
  }
  return channel;
}

export function logInfo(message: string): void {
  getLogger().appendLine(`[INFO] ${message}`);
}

export function logError(message: string, err?: unknown): void {
  const detail = err instanceof Error ? `: ${err.message}` : err ? `: ${String(err)}` : '';
  getLogger().appendLine(`[ERROR] ${message}${detail}`);
}

export function logDebug(message: string): void {
  getLogger().appendLine(`[DEBUG] ${message}`);
}
