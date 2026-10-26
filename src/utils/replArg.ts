/**
 * Quote a path for use as an argument to a cpp-repl colon command (e.g. `:load`).
 *
 * The value is written to the REPL's stdin, not to a shell, so shell escaping
 * rules do not apply. Line breaks and other control characters would be read by
 * the REPL as a second command, and an embedded double quote would break the
 * quoting, so both are rejected rather than escaped (the REPL's unescaping
 * rules are not part of its documented interface).
 */
export function quoteReplArg(value: string): string {
  if (value === '') {
    throw new Error('path is empty');
  }
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) {
      throw new Error('path contains control characters');
    }
  }
  if (value.includes('"')) {
    throw new Error('path contains a double quote');
  }
  return /\s/.test(value) ? `"${value}"` : value;
}
