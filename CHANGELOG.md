# Changelog

## 3.0.1

* Published to npm as `@jesusredondo/re-template-tag`. The unscoped `re-template-tag` belongs to the
  original package, so imports change from `re-template-tag` to `@jesusredondo/re-template-tag`.
* The `exports` entry uses the `default` condition, so `require()` on Node.js 24 loads the package.
* Fix: a string substitution containing `- = ! < > :` no longer throws `Invalid escape` under the
  `u` or `v` flag, as in `` re`/${'2017-01'}/u` ``. `quoteText` now writes those six characters
  as hex escapes (`\x2d`, `\x3d`, `\x21`, `\x3c`, `\x3e`, `\x3a`) instead of a backslash before
  the character. Other metacharacters keep their backslash escape.

## 3.0.0

Git tag only; not published to npm. Breaking changes from `re-template-tag@2.0.1`:

* The CommonJS build is removed. `main` and `module` are replaced by `exports`.
* Node.js 24 is the minimum.
* Type declarations ship in the package. `@types/re-template-tag` is no longer needed.
* Unknown flag letters, as in `` re`/abc/zz` ``, throw `Error: Invalid regular expression flags`
  instead of the `SyntaxError` from the `RegExp` constructor.
