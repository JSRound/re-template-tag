// Packs the package, checks the tarball's file list, installs it into an empty project, and
// loads it by name with `import` and `require()`, as a consumer would.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';

const REQUIRED_FILES = ['LICENSE', 'README.md', 'package.json', 'dist/index.js', 'dist/index.d.ts'];
const FORBIDDEN_PREFIXES = ['src/', 'test/', 'scripts/', 'node_modules/', '.github/'];

const { name } = JSON.parse(readFileSync('package.json', 'utf8'));
const workDir = mkdtempSync(join(tmpdir(), 'tarball-check-'));

try {
  const tarball = packInto(workDir);
  checkFileList(tarball.files.map((file) => file.path));
  const consumerDir = join(workDir, 'consumer');
  installInto(consumerDir, join(workDir, tarball.filename));
  loadByName(consumerDir);
  process.stdout.write(`${tarball.filename}: ${tarball.files.length} files, import and require() ok\n`);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

function packInto(directory) {
  const output = run('npm', ['pack', '--json', '--pack-destination', directory]);
  return JSON.parse(output)[0];
}

function checkFileList(paths) {
  for (const required of REQUIRED_FILES) {
    assert.ok(paths.includes(required), `tarball is missing ${required}`);
  }
  for (const path of paths) {
    const forbidden = FORBIDDEN_PREFIXES.find((prefix) => path.startsWith(prefix));
    assert.equal(forbidden, undefined, `tarball must not contain ${path}`);
  }
}

function installInto(directory, tarballPath) {
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'package.json'), '{ "private": true }\n');
  run('npm', ['install', '--no-audit', '--no-fund', tarballPath], directory);
}

function loadByName(directory) {
  const check = 'if (!re`/^${"2017-01"}$/u`.test("2017-01")) process.exit(1);';
  run('node', ['--input-type=module', '-e', `import { re } from '${name}'; ${check}`], directory);
  run('node', ['--input-type=commonjs', '-e', `const { re } = require('${name}'); ${check}`], directory);
}

function run(command, args, cwd = process.cwd()) {
  return execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
}
