import * as vscode from 'vscode';
import { registerReplCommands } from './commands/replCommands';
import { suppressDiagnosticsForRepl } from './diagnostics/suppress';
import { handleTerminalClosed, disposeTerminal } from './terminal/replTerminal';
import { getLogger } from './core/logger';

/**
 * C++ REPL extension entry point.
 * Delegates to scalable modules: config, terminal, commands, diagnostics.
 */
export function activate(context: vscode.ExtensionContext): void {
  const logger = getLogger();
  logger.appendLine('[INFO] C++ REPL extension activating...');

  // Auto-include behavior: cpp-repl's Interpreter::tryIncludeStdLib() makes
  // `std::cout` valid without explicit #include, so suppress false squiggles.
  suppressDiagnosticsForRepl(context);
  registerReplCommands(context);

  // Clean up cached terminal reference on close
  context.subscriptions.push(
    vscode.window.onDidCloseTerminal(t => handleTerminalClosed(t)),
    logger
  );

  logger.appendLine('[INFO] C++ REPL extension activated.');
}

export function deactivate(): void {
  disposeTerminal();
}
