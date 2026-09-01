# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.3.x   | ✅        |
| 0.2.x   | ✅        |
| <0.2    | ❌        |

## Reporting a Vulnerability

Please report security issues privately via GitHub Security Advisories:

https://github.com/sergiorandria/cpp-repl/security/advisories/new

Or via the vscode extension repository if separate:

https://github.com/sergiorandria/cpp-repl-vscode/security/advisories/new

Do **not** open a public issue for sensitive vulnerabilities. You will receive a response within 72h.

Please include:

- Extension version (`code --list-extensions --show-versions | grep repl`)
- VS Code version (`code --version`)
- OS
- Steps to reproduce
- Impact assessment

## Scope

- This extension executes `cpp-repl` via `vscode.Terminal.sendText`. It does not execute arbitrary code itself beyond what the user selects (`Run Selection`/`Run File`).
- `cppRepl.executablePath` is user-configured; avoid setting it to an untrusted binary.
- No network access, no telemetry.

## Hardening

- All `terminal.sendText` calls are logged to `OutputChannel 'C++ REPL'` for audit.
- Configuration values are resolved via `resolveVariables` with allow-listed `${workspaceFolder}`/`${file}` only.
