# Change Log

All notable changes follow [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/).

## 0.3.0 — 2026-09-01

### Added

- Scalable modular architecture: `src/config`, `src/terminal/replTerminal.ts`, `src/commands/replCommands.ts`, `src/diagnostics/suppress.ts`, `src/utils/variables.ts`, `src/core/logger.ts` (previously monolithic `extension.ts`).
- Tooling: `.editorconfig`, `.eslintrc.json`, `.prettierrc.json`, `.prettierignore`, strict `tsconfig.json`.
- Test suite: `src/test/unit` (grammar, config, variables) + `src/test/suite` (vscode-test) with `mocha`/`@vscode/test-electron`.
- CI: `.github/workflows/ci.yml` (lint, format, compile, unit, package, xvfb vscode tests), `release.yml` (marketplace + OpenVSX + GitHub Release), `codeql.yml`, `dependabot.yml`, PR/issue templates.

### Changed

- `package.json` → `vscode:prepublish`, `lint:fix`, `format`, `format:check`, `test:unit`, `clean`; `devDependencies` add `eslint`, `prettier`, `mocha`, `glob`, `@types/...`, `@vscode/test-electron`.
- Repository URL now points to `cpp-repl-vscode` (was `cpp-repl`).

### Fixed

- Grammar: `auto` in `storage.type`, `std::cout/endl` as `support.variable.std` (see 0.2.1).

## 0.2.1 — 2026-09-01

- Fix: `auto a = 9; auto b = 39; std::cout << a + b << std::endl;` no longer flagged as error in `cpp-repl` language (cpp-repl auto-includes `<bits/stdc++.h>` via `Interpreter::tryIncludeStdLib()`; VS Code squiggles disabled via `configurationDefaults` for `[cpp-repl]`). Grammar now highlights `std::cout`/`std::endl` as `support.variable.std` and `auto` as `storage.type`.
- Fix: `activationEvents` (`onLanguage:cpp-repl`, `onCommand:*`, `onStartupFinished`) so `configurationDefaults` and diagnostic suppression run.
- Fix: extension `suppressDiagnosticsForRepl()` clears stale diagnostics on open.

## 0.2.0 — 2026-09-01

- Initial installable release.
- TextMate grammar `source.cpp-repl` for `*.cpprepl`, `*.cpp-repl`, `*.crepl`, `*.crpl`, `*.repl.cpp`.
- REPL prompt (`cpp>`, `...>`), colon commands (`:help`, `:load`, `:I`, …), output `(type) value`, timing.
- Full C++ highlighting (keywords incl. C++20/23 `concept`/`requires`/`import`/`module`, types `cpp_int`/`bigint`, raw strings, preprocessor, comments).
- Language configuration (brackets, auto-close, indentation).
- Commands: Start/Restart REPL, Run File (`:load`), Run Selection/Line.
- Keybindings `Ctrl+Enter` / `Ctrl+Shift+Enter`.
- Settings `cppRepl.executablePath`, `extraArgs`, `includePaths`, `clearOnRun`.
- Terminal profile `C++ REPL`.
