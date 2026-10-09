/** A pattern fragment, or text that must be matched literally. */
type PatternSubstitution = RegExp | string;

const FLAGS = /^[dgimsuvy]*$/;

/**
 * Compose a regular expression.
 * A `RegExp` substitution inserts its source. A string substitution is escaped.
 * Start the template with `/` to set flags: `` re`/pattern/flags` ``.
 */
export function re(
  template: TemplateStringsArray,
  ...substitutions: readonly PatternSubstitution[]
): RegExp {
  const pattern = composePattern(template, substitutions);
  const { source, flags } = splitPattern(pattern);
  return new RegExp(source, flags);
}

function composePattern(
  template: TemplateStringsArray,
  substitutions: readonly PatternSubstitution[],
): string {
  let pattern = transformRaw(template.raw[0] ?? '');
  for (const [index, substitution] of substitutions.entries()) {
    pattern += substitutionText(substitution);
    pattern += transformRaw(template.raw[index + 1] ?? '');
  }
  return pattern;
}

function substitutionText(substitution: unknown): string {
  if (isRegExpFragment(substitution)) {
    return substitution.source;
  }
  if (isLiteralText(substitution)) {
    return quoteText(substitution);
  }
  throw new Error(`Illegal substitution: ${String(substitution)}`);
}

function isRegExpFragment(substitution: unknown): substitution is RegExp {
  return substitution instanceof RegExp;
}

function isLiteralText(substitution: unknown): substitution is string {
  return typeof substitution === 'string';
}

function splitPattern(pattern: string): { source: string; flags: string } {
  if (!startsWithDelimiter(pattern)) {
    return { source: pattern, flags: '' };
  }
  const closingSlash = pattern.lastIndexOf('/');
  if (isMissingClosingSlash(closingSlash)) {
    throw new Error(missingClosingSlashMessage(pattern));
  }
  const flags = pattern.slice(closingSlash + 1);
  if (!isFlagString(flags)) {
    throw new Error(`Invalid regular expression flags: ${flags}`);
  }
  return { source: pattern.slice(1, closingSlash), flags };
}

function startsWithDelimiter(pattern: string): boolean {
  return pattern.startsWith('/');
}

function isMissingClosingSlash(closingSlash: number): boolean {
  return closingSlash === 0;
}

function isFlagString(flags: string): boolean {
  return FLAGS.test(flags);
}

function missingClosingSlashMessage(pattern: string): string {
  return (
    'If the `re` string starts with a slash, it must end with a second slash and zero or more flags: ' +
    pattern
  );
}

function transformRaw(text: string): string {
  return text.replace(/\\`/g, '`');
}

/**
 * Escape every regex metacharacter, including inside parentheses or a character class.
 */
export function quoteText(text: string): string {
  return text.replace(/[\\^$.*+?()[\]{}|=!<>:-]/g, '\\$&');
}
