# @jsround/re-template-tag: easily compose regular expressions

This package provides the template tag `re` for composing regular expressions.

It is a TypeScript fork of [rauschma/re-template-tag](https://github.com/rauschma/re-template-tag),
published as `@jsround/re-template-tag`. The unscoped `re-template-tag` on npm is the original 2.0.1.

## Install

```sh
npm install @jsround/re-template-tag
```

Requirements:

* Node.js 24 or newer.
* ES module. Use `import`, or `require()` on Node.js 24, which loads ES modules.
* Type declarations are included. Do not install `@types/re-template-tag`.

## Basic syntax

Syntax: the following two expressions produce the same regular expression.

```js
re`/abc/gu`
/abc/gu
```

## Composing regular expressions

```js
import {re} from '@jsround/re-template-tag';

const RE_YEAR = /([0-9]{4})/;
const RE_MONTH = /([0-9]{2})/;
const RE_DAY = /([0-9]{2})/;
const RE_DATE = re`/^${RE_YEAR}-${RE_MONTH}-${RE_DAY}$/u`;

RE_DATE.test('2017-01-23'); // true
```

A `RegExp` substitution inserts its source. A string substitution is matched literally.
Any other substitution throws `Error`.

## Escaping text

`quoteText` escapes every regular expression metacharacter, including inside parentheses
or a character class. `re` applies it to every string substitution.

```js
import {quoteText} from '@jsround/re-template-tag';

quoteText('1+1=2'); // '1\\+1\\x3d2'
```

`- = ! < > :` become hex escapes such as `\x2d`, because the `u` and `v` flags reject a
backslash before them. The result is a literal match with any flags.

## Checks

```sh
npm run typecheck
npm run lint
npm run build
npm test
```

`npm test` builds first, then the unit tests import the package by its own name,
which resolves through `exports` to `dist/index.js`.

## Releases

Changes are listed in [CHANGELOG.md](./CHANGELOG.md). Pushing a tag `vX.Y.Z` that matches the
`version` in `package.json` publishes that version to npm with provenance.

## More information

* Take a look at [the unit tests](https://github.com/JSRound/re-template-tag/blob/master/test/index.test.js).
* Check out [the blog post on re-template-tag](http://2ality.com/2017/07/re-template-tag.html).

## Related work

* http://xregexp.com
* https://github.com/DmitrySoshnikov/regexp-tree
* https://github.com/shannonmoeller/regx

## Acknowledgement

The syntax for separating flags from the actual regular expression is based on an idea by [Mathias Bynens](https://twitter.com/mathias/).
