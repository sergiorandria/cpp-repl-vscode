# Support

## Getting help

- **Docs**: see [README.md](README.md) (Quick start, File types, Architecture, Development).
- **Examples**: `examples/demo.cpprepl`, `examples/minimal.cpprepl` and `cpp-repl` examples at `../cpp-repl/examples/`.
- **Issues**: search existing issues at https://github.com/sergiorandria/cpp-repl-vscode/issues before opening a new one. Use the Bug report / Feature request templates.
- **Discussions**: use GitHub Discussions on the `cpp-repl` repo for questions.

## Supported versions

| VS Code | Extension | Status                          |
| ------- | --------- | ------------------------------- |
| >=1.85  | 0.3.x     | ✅ Supported                    |
| <1.85   | any       | ❌ Unsupported (update VS Code) |

`cpp-repl` executable: LLVM 22 + Clang 22 required (`cpp-repl --version`). Build via `cmake -B build && cmake --build build -j`.

## Troubleshooting

**`cpp-repl: command not found` in terminal**

- Set `cppRepl.executablePath` in `.vscode/settings.json`:
  ```jsonc
  { "cppRepl.executablePath": "${workspaceFolder}/../cpp-repl/build/cpp-repl" }
  ```

**`std::cout` flagged as error**

- Open the file as language **C++ REPL** (bottom-right picker) or use `*.cpprepl` extension. Squiggles are disabled for `[cpp-repl]` via `configurationDefaults` (auto-include of `<bits/stdc++.h>`).

**No syntax highlighting**

- Ensure the file language is `C++ REPL` (`View → Command Palette → Change Language Mode`).
- Reload window: `Developer: Reload Window`.

**REPL not starting**

- Check `OutputChannel 'C++ REPL'` (`View → Output`) for logs.
- Check `cpp-repl` binary is executable: `chmod +x build/cpp-repl && ./build/cpp-repl --version`.

## Commercial support

No SLA. For sponsored work, see https://github.com/sponsors/sergiorandria.
