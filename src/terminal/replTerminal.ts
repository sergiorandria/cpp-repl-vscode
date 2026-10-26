import * as vscode from 'vscode';
import { getExecutablePath, buildLaunchArgs, getConfig } from '../config';
import { logInfo, logError } from '../core/logger';

let replTerminal: vscode.Terminal | undefined;

const TERMINAL_READY_TIMEOUT_MS = 10_000;

/**
 * Wait until the terminal's backing process has started.
 *
 * `createTerminal` returns before VS Code has spawned the pty process, and text
 * written before then can be dropped. Waiting for `processId` makes `:load`
 * reliable on slow machines without a fixed sleep.
 */
export async function waitForTerminalReady(term: vscode.Terminal): Promise<void> {
  if (term.exitStatus !== undefined) {
    throw new Error('terminal is not running');
  }
  let timeout: NodeJS.Timeout | undefined;
  let processId: number | undefined;
  try {
    processId = await Promise.race([
      Promise.resolve(term.processId),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`terminal did not start within ${TERMINAL_READY_TIMEOUT_MS}ms`)),
          TERMINAL_READY_TIMEOUT_MS
        );
      }),
    ]);
  } finally {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
  }
  if (processId === undefined || term.exitStatus !== undefined) {
    throw new Error('terminal exited before input could be sent');
  }
}

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

  // Launch the executable directly instead of typing a command line into the
  // user's shell. This passes paths/arguments verbatim (no shell injection,
  // quoting, or escaping issues) and lets VS Code feed `:load` commands to the
  // REPL process as soon as it starts, without racing a shell prompt.
  replTerminal = vscode.window.createTerminal({
    name: 'C++ REPL',
    shellPath: executable,
    shellArgs: launchArgs,
  });
  return replTerminal;
}

/**
 * Send text to the REPL terminal, optionally clearing first.
 */
export async function sendToRepl(text: string, addNewline = true): Promise<void> {
  try {
    const term = getOrCreateTerminal();
    term.show(true);
    await waitForTerminalReady(term);
    const { clearOnRun } = getConfig();
    if (clearOnRun) {
      // `:clear` is a cpp-repl colon command; a bare `clear` would be parsed as
      // C++ code and fail.
      term.sendText(':clear');
    }
    const toSend = addNewline ? text.replace(/\n+$/, '') : text;
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
  if (replTerminal === terminal) {
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
