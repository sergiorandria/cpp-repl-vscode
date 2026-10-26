import * as assert from 'assert';
import { quoteReplArg } from '../../utils/replArg';

suite('replArg - quoteReplArg', () => {
  test('leaves plain paths untouched', () => {
    assert.strictEqual(quoteReplArg('/home/user/src/main.cpp'), '/home/user/src/main.cpp');
  });

  test('quotes paths containing whitespace', () => {
    assert.strictEqual(
      quoteReplArg('/home/user/my project/main.cpp'),
      '"/home/user/my project/main.cpp"'
    );
  });

  test('quotes shell metacharacters (they are not interpreted on REPL stdin)', () => {
    assert.strictEqual(quoteReplArg('/tmp/a;b$(c).cpp'), '/tmp/a;b$(c).cpp');
    assert.strictEqual(quoteReplArg('/tmp/a b; rm -rf /'), '"/tmp/a b; rm -rf /"');
  });

  test('rejects paths containing line breaks or control characters', () => {
    assert.throws(() => quoteReplArg('/tmp/a.cpp\n:quit'), /control characters/);
    assert.throws(() => quoteReplArg('/tmp/a.cpp\r\n:quit'), /control characters/);
    assert.throws(() => quoteReplArg('/tmp/a\u0000.cpp'), /control characters/);
    assert.throws(() => quoteReplArg('/tmp/a\tb.cpp'), /control characters/);
  });

  test('rejects an empty path', () => {
    assert.throws(() => quoteReplArg(''), /empty/);
  });

  test('rejects paths containing a double quote', () => {
    assert.throws(() => quoteReplArg('/tmp/a"b.cpp'), /double quote/);
  });
});
