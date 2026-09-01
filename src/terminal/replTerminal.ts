import * as vscode from 'vscode';
import { getExecutablePath, buildLaunchArgs, getConfig } from '../config';
import { logInfo, logError } from '../core/logger';

let replTerminal: vscode.Terminal | undefined;

/**
 * Get or create the persistent C++ REPL terminal.
 * Reuses existing terminal named "C++ REPL" when available.
 */
export function getOrCreateTerminal(): vscode.Terminal {
  if (replTerminal) {
    try {
      // Accessing name will throw if terminal was disposed
      void replTerminal.name;
      if (replTerminal.exitStatus === undefined) {
        return replTerminal;
      }
    } catch {
      replTerminal = undefined;
    }
  }

  const existing = vscode.window.terminals.find(t => t.name === 'C++ REPL');
  if (existing) {
    replTerminal = existing;
    return existing;
  }

  const executable = getExecutablePath();
  const launchArgs = buildLaunchArgs();
  const argString = launchArgs.length ? ` ${launchArgs.join(' ')}` : '';

  logInfo(`Creating REPL terminal: ${executable}${argString}`);

  replTerminal = vscode.window.createTerminal({ name: 'C++ REPL' });
  const cmd = `${executable}${argString}`;
  replTerminal.sendText(cmd);
  return replTerminal;
}

/**
 * Send text to the REPL terminal, optionally clearing first.
 */
export function sendToRepl(text: string, addNewline = true): void {
  const term = getOrCreateTerminal();
  term.show(true);
  const { clearOnRun } = getConfig();
  if (clearOnRun) {
    term.sendText('clear');
  }
  const toSend = addNewline ? text.replace(/\n+$/, '') : text;
  try {
    term.sendText(toSend, addNewline);
  } catch (err) {
    logError('Failed to send text to REPL terminal', err);
    vscode.window.showErrorMessage(`C++ REPL: failed to send code to terminal: ${String(err)}`);
  }
}

/**
 * Dispose and recreate the REPL terminal.
 */
export function restartTerminal(): vscode.Terminal {
  if (replTerminal) {
    try {
      replTerminal.dispose();
    } catch (err) {
      logError('Failed to dispose REPL terminal', err);
    }
    replTerminal = undefined;
  }
  // Also dispose any stray "C++ REPL" terminals
  for (const t of vscode.window.terminals.filter(t => t.name === 'C++ REPL')) {
    try {
      t.dispose();
    } catch (err) {
      logError('Failed to dispose stray REPL terminal', err);
    }
  }
  const term = getOrCreateTerminal();
  term.show(true);
  return term;
}

/**
 * Handle terminal close events to clear cached reference.
 */
export function handleTerminalClosed(terminal: vscode.Terminal): void {
  if (replTerminal && terminal.name === replTerminal.name) {
    replTerminal = undefined;
  }
}

/**
 * Dispose cached terminal on deactivate.
 */
export function disposeTerminal(): void {
  if (replTerminal) {
    try {
      replTerminal.dispose();
    } catch {
      // ignore
    }
    replTerminal = undefined;
  }
}
