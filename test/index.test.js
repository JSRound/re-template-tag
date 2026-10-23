// Imports the package by its own name, so the `exports` map and the built `dist/` are what is
// tested. `npm test` runs `pretest`, which builds first.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { quoteText, re } from '@jround/re-template-tag';

const require = createRequire(import.meta.url);

const SYNTAX_CHARACTERS = '\\^$.*+?()[]{}|';
const HEX_ESCAPES = { '=': '\\x3d', '!': '\\x21', '<': '\\x3c', '>': '\\x3e', ':': '\\x3a', '-': '\\x2d' };
const METACHARACTERS = SYNTAX_CHARACTERS + Object.keys(HEX_ESCAPES).join('');
const FLAG_MODES = ['', 'u', 'v'];

test('Composing regular expressions', () => {
  const RE_YEAR = /([0-9]{4})/;
  const RE_MONTH = /([0-9]{2})/;
  const RE_DAY = /([0-9]{2})/;
  const RE_DATE = re`/^${RE_YEAR}-${RE_MONTH}-${RE_DAY}$/u`;
  assert.equal(RE_DATE.source, '^([0-9]{4})-([0-9]{2})-([0-9]{2})$');
});

test('Setting flags', () => {
  const regexp1 = re`/abc/gu`;
  assert.equal(regexp1 instanceof RegExp, true);
  assert.equal(regexp1.source, 'abc');
  assert.equal(regexp1.flags, 'gu');

  const regexp2 = re`/xyz/`;
  assert.equal(regexp2 instanceof RegExp, true);
  assert.equal(regexp2.source, 'xyz');
  assert.equal(regexp2.flags, '');
});

test('Computed flags', () => {
  const regexp = re`/abc/${'g' + 'u'}`;
  assert.equal(regexp instanceof RegExp, true);
  assert.equal(regexp.source, 'abc');
  assert.equal(regexp.flags, 'gu');
});

test('Simple, flag-less mode', () => {
  const regexp = re`abc`;
  assert.equal(regexp instanceof RegExp, true);
  assert.equal(regexp.source, 'abc');
  assert.equal(regexp.flags, '');
});

test('Escaping special characters in strings', () => {
  assert.equal(re`/-${'.'}-/u`.source, '-\\.-');
});

test('Use “raw” backslashes like in regular expressions', () => {
  assert.equal(re`/\./u`.source, '\\.');
});

test('Slashes don’t need to be escaped', () => {
  assert.equal(re`/^/$/u`.test('/'), true);
});

test('Escaping backticks', () => {
  const RE_BACKTICK = re`/^\`$/u`;
  assert.equal(RE_BACKTICK.source, '^`$');
  assert.equal(RE_BACKTICK.test('`'), true);

  const str = '`\\`';
  assert.equal(re`/${str}/`.source, '`\\\\`');
});

test('a slash inside an interpolated character class', () => {
  const characterClass = /[a-z0-9._/+-]/;
  const scope = re`/${characterClass}+/`;
  assert.equal(scope.source, '[a-z0-9._/+-]+');
  assert.equal(scope.flags, '');
  assert.equal(String(scope), '/[a-z0-9._/+-]+/');
});

test('a missing closing slash', () => {
  assert.throws(
    () => re`/abc`,
    {
      name: 'Error',
      message:
        'If the `re` string starts with a slash, it must end with a second slash and zero or more flags: /abc',
    },
  );
});

test('invalid flags', () => {
  assert.throws(() => re`/abc/zz`, {
    name: 'Error',
    message: 'Invalid regular expression flags: zz',
  });
});

test('a non-string non-RegExp substitution', () => {
  assert.throws(() => re`/${1}/`, {
    name: 'Error',
    message: 'Illegal substitution: 1',
  });
});

test('quoteText backslash-escapes syntax characters', () => {
  for (const character of SYNTAX_CHARACTERS) {
    assert.equal(quoteText(character), `\\${character}`);
  }
});

test('quoteText hex-escapes characters that u and v mode reject after a backslash', () => {
  for (const [character, escaped] of Object.entries(HEX_ESCAPES)) {
    assert.equal(quoteText(character), escaped);
  }
});

test('quoteText leaves other characters unchanged', () => {
  assert.equal(quoteText('abc 123_/'), 'abc 123_/');
  assert.equal(quoteText(''), '');
});

test('quoteText output matches its input literally with any flags', () => {
  const text = `a${METACHARACTERS}z`;
  for (const flags of FLAG_MODES) {
    const regexp = new RegExp(`^${quoteText(text)}$`, flags);
    assert.equal(regexp.test(text), true, `flags "${flags}"`);
    assert.equal(regexp.test('az'), false, `flags "${flags}"`);
  }
});

test('quoteText output is literal inside a character class with any flags', () => {
  for (const flags of FLAG_MODES) {
    const regexp = new RegExp(`^[${quoteText('^a-z]')}]+$`, flags);
    assert.equal(regexp.test('^a-z]'), true, `flags "${flags}"`);
    assert.equal(regexp.test('b'), false, `flags "${flags}"`);
  }
});

test('a string substitution with a hyphen under the u flag', () => {
  const regexp = re`/^${'2017-01'}$/u`;
  assert.equal(regexp.test('2017-01'), true);
  assert.equal(regexp.test('2017x01'), false);
});

test('require() resolves the package through exports', () => {
  const required = require('@jround/re-template-tag');
  assert.equal(required.re, re);
  assert.equal(required.quoteText, quoteText);
});
