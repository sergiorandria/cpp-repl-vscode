# Contributing to cpp-repl-vscode

Thanks for your interest in improving the VS Code extension for [cpp-repl](https://github.com/sergiorandria/cpp-repl)!

## Development setup

Requires Node 20+, VS Code 1.85+.

```bash
git clone https://github.com/sergiorandria/cpp-repl-vscode.git
cd cpp-repl-vscode
npm ci
npm run compile      # tsc -> out/
npm run lint         # eslint
npm run format:check # prettier
npx mocha --ui tdd out/test/unit/**/*.test.js  # unit tests
```

### Run in Extension Development Host

- Press `F5` (Run Extension) → opens host with extension loaded.
- Open `examples/demo.cpprepl` or `examples/minimal.cpprepl` → set language to **C++ REPL** (bottom-right).
- Test commands: `Ctrl+Enter` (run selection), `Ctrl+Shift+Enter` (run file), `Command Palette → C++ REPL: Start`.

### Project structure

```
src/
  extension.ts              # thin activator
  config/                   # CppReplConfig, getConfig(), buildLaunchArgs(), getExecutablePath()
  terminal/replTerminal.ts  # getOrCreateTerminal(), sendToRepl(), restartTerminal()
  commands/replCommands.ts  # registerReplCommands()
  diagnostics/suppress.ts   # suppressDiagnosticsForRepl()
  utils/variables.ts        # resolveVariables()
  core/logger.ts            # OutputChannel 'C++ REPL'
  test/
    unit/*.test.ts          # grammar, config, variables
    suite/*.test.ts         # vscode integration (vscode-test)
syntaxes/
  cpp-repl.tmLanguage.json
  cpp-repl-session.tmLanguage.json
snippets/cpp-repl.json
language-configuration.json
```

Scalability principles:

- **Single responsibility** per module (no monolithic `extension.ts`).
- **Pure functions** for `config`/`variables` — testable without VS Code.
- **Side-effects isolated** in `terminal/` (only module that touches `vscode.Terminal`).

## Code style

```bash
npm run lint:fix    # auto-fix eslint
npm run format      # prettier write
```

- TypeScript `strict: true`, `noImplicitAny: true`.
- Follow `.editorconfig` (2 spaces, LF, `prettier` 100 width).
- Use `src/core/logger.ts` for diagnostics, not `console.log`.

## Commit messages

Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`, `refactor:`, `test:`.

Example: `fix: suppress squiggles for auto cout without include`

## Pull requests

- Keep PRs small and focused.
- Describe testing: `npm run lint`, `npm run compile`, unit + manual host test.
- Update `README.md` / `CHANGELOG.md` if user-facing.
- CI must pass (`ci.yml`: lint, format, compile, unit, package).

## Grammar changes

- Edit `syntaxes/cpp-repl.tmLanguage.json` (TextMate).
- Validate: `node -e "JSON.parse(require('fs').readFileSync('syntaxes/cpp-repl.tmLanguage.json','utf8'))"`
- Test tokenization: see `src/test/unit/grammar.test.ts` — add sample `auto a=9; std::cout…` if you touch `keywords`/`types`.

## Release

Maintainers:

```bash
npm version patch|minor|major
npm run compile && npx vsce package
git push --follow-tags
# CI release.yml publishes to Marketplace (VSCE_PAT) + OpenVSX (OVSX_PAT)
```
