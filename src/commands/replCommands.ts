import * as vscode from 'vscode';
import {
  getOrCreateTerminal,
  sendToRepl,
  restartTerminal,
  waitForTerminalReady,
} from '../terminal/replTerminal';
import { logInfo, logError } from '../core/logger';
import { quoteReplArg } from '../utils/replArg';

/**
 * Register all cpp-repl commands.
 * Commands are thin wrappers delegating to terminal helpers.
 */
export function registerReplCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('cpp-repl.startRepl', async () => {
      try {
        const term = getOrCreateTerminal();
        term.show(true);
        await waitForTerminalReady(term);
        vscode.window.showInformationMessage('C++ REPL started.');
        logInfo('REPL started via command');
      } catch (err) {
        logError('Failed to start REPL', err);
        vscode.window.showErrorMessage(`C++ REPL: failed to start: ${String(err)}`);
      }
    }),

    vscode.commands.registerCommand('cpp-repl.restartRepl', async () => {
      try {
        const term = restartTerminal();
        term.show(true);
        await waitForTerminalReady(term);
        vscode.window.showInformationMessage('C++ REPL restarted.');
        logInfo('REPL restarted');
      } catch (err) {
        logError('Failed to restart REPL', err);
        vscode.window.showErrorMessage(`C++ REPL: failed to restart: ${String(err)}`);
      }
    }),

    vscode.commands.registerCommand('cpp-repl.runFile', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active file to run.');
        return;
      }
      const doc = editor.document;
      if (doc.isDirty) {
        let saved = false;
        try {
          saved = await doc.save();
        } catch (err) {
          logError('Failed to save document before run', err);
        }
        if (!saved) {
          vscode.window.showWarningMessage(
            'C++ REPL: the file must be saved before it can be loaded.'
          );
          return;
        }
      }
      if (doc.uri.scheme !== 'file') {
        vscode.window.showWarningMessage(
          'C++ REPL: only files saved to disk can be loaded into the REPL.'
        );
        return;
      }
      const filePath = doc.uri.fsPath;
      let loadCommand: string;
      try {
        loadCommand = `:load ${quoteReplArg(filePath)}`;
      } catch (err) {
        logError('Refusing to load file with unsupported characters in its path', err);
        vscode.window.showErrorMessage(`C++ REPL: cannot load ${filePath}: ${String(err)}`);
        return;
      }
      logInfo(`Running file in REPL: ${loadCommand}`);
      try {
        // The terminal runs the REPL directly, so text is written straight to
        // the REPL's stdin. Wait for the process to start instead of racing it.
        const term = getOrCreateTerminal();
        term.show(true);
        await waitForTerminalReady(term);
        term.sendText(loadCommand);
      } catch (err) {
        logError('Failed to send :load', err);
        vscode.window.showErrorMessage(`C++ REPL: failed to load file in terminal: ${String(err)}`);
      }
    }),

    vscode.commands.registerCommand('cpp-repl.runSelection', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor.');
        return;
      }
      let text = editor.document.getText(editor.selection);
      if (!text || text.trim() === '') {
        const line = editor.document.lineAt(editor.selection.active.line);
        text = line.text;
        if (!text.trim()) {
          vscode.window.showWarningMessage('No code selected.');
          return;
        }
      }
      logInfo(`Running selection (${text.length} chars) in REPL`);
      await sendToRepl(text, true);
    })
  );
}
