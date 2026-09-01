import * as assert from 'assert';

suite('Variables - placeholder', () => {
  test('should replace workspaceFolder variables', () => {
    const template = '${workspaceFolder}/../cpp-repl/build/cpp-repl';
    const workspace = '/home/sergio/Project';
    const resolved = template.replace(/\$\{workspaceFolder\}/g, workspace);
    assert.strictEqual(resolved, '/home/sergio/Project/../cpp-repl/build/cpp-repl');
  });

  test('should handle multiple variable substitutions', () => {
    const input = '${workspaceFolder}/include:${fileDirname}/lib';
    const ws = '/ws';
    const fileDir = '/ws/src';
    let out = input.replace(/\$\{workspaceFolder\}/g, ws);
    out = out.replace(/\$\{fileDirname\}/g, fileDir);
    assert.strictEqual(out, '/ws/include:/ws/src/lib');
  });
});
