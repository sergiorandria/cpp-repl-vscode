import * as vscode from 'vscode';
import { getOrCreateTerminal, sendToRepl, restartTerminal } from '../terminal/replTerminal';
import { logInfo, logError } from '../core/logger';

/**
 * Register all cpp-repl commands.
 * Commands are thin wrappers delegating to terminal helpers.
 */
export function registerReplCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('cpp-repl.startRepl', () => {
      try {
        const term = getOrCreateTerminal();
        term.show(true);
        vscode.window.showInformationMessage('C++ REPL started.');
        logInfo('REPL started via command');
      } catch (err) {
        logError('Failed to start REPL', err);
        vscode.window.showErrorMessage(`C++ REPL: failed to start: ${String(err)}`);
      }
    }),

    vscode.commands.registerCommand('cpp-repl.restartRepl', () => {
      try {
        const term = restartTerminal();
        term.show(true);
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
        try {
          await doc.save();
        } catch (err) {
          logError('Failed to save document before run', err);
        }
      }
      const filePath = doc.uri.fsPath;
      const term = getOrCreateTerminal();
      term.show(true);
      const quoted = filePath.includes(' ') ? `"${filePath}"` : filePath;
      logInfo(`Running file in REPL: ${quoted}`);
      // Delay to ensure REPL is ready after terminal creation
      setTimeout(() => {
        try {
          term.sendText(`:load ${quoted}`);
        } catch (err) {
          logError('Failed to send :load', err);
        }
      }, 300);
    }),

    vscode.commands.registerCommand('cpp-repl.runSelection', () => {
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
      sendToRepl(text, true);
    })
  );
}
