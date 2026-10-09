// Imports the built module. `npm test` runs `pretest`, which builds first.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { re } from '../dist/index.js';

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
