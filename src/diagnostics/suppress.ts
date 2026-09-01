import * as vscode from 'vscode';
import { logDebug } from '../core/logger';

/**
 * Suppress false positives for cpp-repl language.
 *
 * cpp-repl auto-includes <bits/stdc++.h> via Interpreter::tryIncludeStdLib(),
 * so `auto a=9; std::cout << a+b << std::endl;` is valid WITHOUT explicit
 * #include. C_Cpp/clangd squiggles are disabled via configurationDefaults in
 * package.json for [cpp-repl], but we also proactively clear stale diagnostics
 * that may have been published before defaults took effect.
 */
export function suppressDiagnosticsForRepl(context: vscode.ExtensionContext): void {
  const collection = vscode.languages.createDiagnosticCollection('cpp-repl-suppress');
  context.subscriptions.push(collection);

  const clearForDoc = (doc: vscode.TextDocument): void => {
    if (doc.languageId === 'cpp-repl') {
      logDebug(`Clearing diagnostics for ${doc.uri.fsPath}`);
      collection.set(doc.uri, []);
    }
  };

  // Clear for already open documents
  for (const doc of vscode.workspace.textDocuments) {
    clearForDoc(doc);
  }

  // Clear on open (delayed, to race against C_Cpp publish)
  const openDisposable = vscode.workspace.onDidOpenTextDocument(doc => {
    if (doc.languageId === 'cpp-repl') {
      setTimeout(() => collection.set(doc.uri, []), 300);
    }
  });
  context.subscriptions.push(openDisposable);

  // Optional: also clear on save, as some language servers re-publish on save
  const saveDisposable = vscode.workspace.onDidSaveTextDocument(doc => {
    if (doc.languageId === 'cpp-repl') {
      setTimeout(() => collection.set(doc.uri, []), 400);
    }
  });
  context.subscriptions.push(saveDisposable);
}
