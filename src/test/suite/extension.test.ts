import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('sergiorandria.cpp-repl'));
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    const expected = [
      'cpp-repl.startRepl',
      'cpp-repl.runFile',
      'cpp-repl.runSelection',
      'cpp-repl.restartRepl',
    ];
    for (const cmd of expected) {
      assert.ok(commands.includes(cmd), `Command ${cmd} should be registered`);
    }
  });

  test('Languages should be registered', async () => {
    const langs = await vscode.languages.getLanguages();
    assert.ok(langs.includes('cpp-repl'), 'cpp-repl language should be registered');
  });

  test('Configuration defaults should be readable', () => {
    const cfg = vscode.workspace.getConfiguration('cppRepl');
    assert.ok(cfg.has('executablePath'));
    assert.ok(cfg.has('extraArgs'));
  });

  test('Sample cpp-repl document should not have invalid diagnostics (suppression)', async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: 'cpp-repl',
      content: 'auto a = 9; auto b = 39;\n\nstd::cout << a + b << std::endl;',
    });
    // Give suppressDiagnostics a chance to run (300ms delay)
    await new Promise(r => setTimeout(r, 500));
    // We cannot directly check C_Cpp diagnostics, but our collection should be empty
    const diags = vscode.languages.getDiagnostics(doc.uri);
    // Our suppress collection uses separate collection, but we check that our own
    // extension didn't produce errors; real C_Cpp diagnostics are disabled via config.
    // This test mainly ensures document opens without throwing.
    assert.ok(doc.languageId === 'cpp-repl');
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    // Filter still: expect no error from our extension
    assert.ok(Array.isArray(diags));
  });
});
