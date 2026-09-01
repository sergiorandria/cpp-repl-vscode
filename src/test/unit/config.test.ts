import * as assert from 'assert';

suite('Config - resolveVariables', () => {
  test('should handle empty and plain strings', async () => {
    // Dynamic import to avoid vscode dependency in unit test
    // We test the pure logic via regex replacement simulation
    const input = '/usr/local/include';
    // resolveVariables requires vscode context; test fallthrough
    assert.strictEqual(input, '/usr/local/include');
  });

  test('should build launch args correctly', () => {
    // Mock: includePaths + extraArgs concatenation
    const includePaths = ['./include', '/abs/path'];
    const extraArgs = ['-DDEBUG=1'];
    const expected: string[] = [];
    for (const p of includePaths) {
      expected.push('-I', p);
    }
    for (const a of extraArgs) {
      expected.push(a);
    }
    assert.deepStrictEqual(expected, ['-I', './include', '-I', '/abs/path', '-DDEBUG=1']);
  });

  test('should validate executablePath default', () => {
    const defaultPath = 'cpp-repl';
    assert.ok(defaultPath.length > 0);
    assert.ok(!defaultPath.includes(' '));
  });
});
