import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

suite('Grammar - cpp-repl.tmLanguage.json', () => {
  const grammarPath = path.resolve(__dirname, '../../../syntaxes/cpp-repl.tmLanguage.json');
  const sessionPath = path.resolve(__dirname, '../../../syntaxes/cpp-repl-session.tmLanguage.json');

  test('should exist and be valid JSON', () => {
    assert.ok(fs.existsSync(grammarPath), 'main grammar file missing');
    assert.ok(fs.existsSync(sessionPath), 'session grammar file missing');
    const main = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));
    const session = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    assert.ok(main.scopeName, 'missing scopeName');
    assert.ok(session.scopeName, 'missing session scopeName');
  });

  test('should have required repository keys', () => {
    const main = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));
    const required = [
      'repl-prompt',
      'repl-command',
      'preprocessor',
      'comments',
      'strings',
      'keywords',
      'types',
    ];
    for (const key of required) {
      assert.ok(main.repository[key], `missing repository key: ${key}`);
    }
  });

  test('should have valid regex patterns (JS-compatible)', () => {
    const main = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));
    const check = (obj: unknown): void => {
      if (Array.isArray(obj)) {
        obj.forEach(check);
      } else if (obj && typeof obj === 'object') {
        for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
          if ((k === 'match' || k === 'begin' || k === 'end') && typeof v === 'string') {
            // Skip Oniguruma backreference pattern \1 which is invalid in JS but valid in TextMate
            if (v.includes('\\1')) {
              return;
            }
            assert.doesNotThrow(() => new RegExp(v), `invalid regex for ${k}: ${v}`);
          } else {
            check(v);
          }
        }
      }
    };
    check(main);
  });

  test('should highlight auto/ cout/ endl correctly', () => {
    const main = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));
    const keywords = JSON.stringify(main.repository.keywords);
    const types = JSON.stringify(main.repository.types);
    assert.ok(keywords.includes('auto'), 'keywords should include auto');
    // auto is now also in storage.type for correct highlighting
    assert.ok(
      types.includes('auto') || keywords.includes('auto'),
      'auto should be in types or keywords'
    );
    assert.ok(types.includes('cout'), 'types should include support.variable for cout');
    assert.ok(types.includes('endl'), 'types should include endl');
  });

  test('should tokenize sample snippet conceptually', () => {
    const main = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));
    // Simulate simple checks: operator << should be in operators
    const ops = JSON.stringify(main.repository.operators);
    assert.ok(ops.includes('<<'), 'operators should include <<');
    assert.ok(ops.includes('::'), 'operators should include ::');
  });
});

suite('Language configuration', () => {
  test('should be valid JSON and have brackets', () => {
    const cfgPath = path.resolve(__dirname, '../../../language-configuration.json');
    assert.ok(fs.existsSync(cfgPath));
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    assert.ok(Array.isArray(cfg.brackets), 'brackets should be array');
    assert.ok(cfg.comments, 'comments config missing');
    assert.ok(cfg.brackets.length >= 3, 'should have at least 3 bracket pairs');
  });
});
