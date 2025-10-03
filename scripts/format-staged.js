#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

function out(command, args) {
  const res = spawnSync(command, args, { stdio: 'pipe', encoding: 'utf8' });
  if (res.error) throw res.error;
  if (typeof res.status === 'number' && res.status !== 0) {
    process.stdout.write(res.stdout ?? '');
    process.stderr.write(res.stderr ?? '');
    process.exit(res.status);
  }
  return (res.stdout ?? '').trim();
}
function tryRun(command, args) {
  const res = spawnSync(command, args, { stdio: 'inherit', encoding: 'utf8' });
  if (res.error) return res.error;
  if (typeof res.status === 'number' && res.status !== 0) {
    process.exit(res.status);
  }
  return null;
}

// Collect staged files
let files = (process.env.HUSKY_STAGED_FILES ?? '').trim();
if (!files) {
  try {
    files = out('git', ['diff', '--name-only', '--cached']);
  } catch (error) {
    if (error && (error.code === 'EPERM' || error.errno === 'EPERM')) {
      console.warn('[prettier] Unable to inspect staged files; skipping formatting.');
      process.exit(0);
    }
    throw error;
  }
}
if (!files) process.exit(0);

const exts = [
  '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.css', '.scss', '.yml', '.yaml', '.html', '.cjs', '.mjs'
];

const list = files
  .split('\n')
  .filter((f) => exts.some((e) => f.endsWith(e)))
  .filter((f) => !/node_modules\//.test(f));

if (list.length === 0) process.exit(0);

const formatted = [];

for (const file of list) {
  if (!fs.existsSync(file)) continue;
  const abs = path.resolve(file);
  try {
    const fileInfo = prettier.getFileInfo.sync(abs, { ignorePath: '.prettierignore' });
    if (fileInfo.ignored || !fileInfo.inferredParser) continue;
    const source = fs.readFileSync(abs, 'utf8');
    const config = prettier.resolveConfig.sync(abs, { editorconfig: true }) ?? {};
    const output = prettier.format(source, { ...config, filepath: abs });
    if (output !== source) {
      fs.writeFileSync(abs, output, 'utf8');
      formatted.push(file);
    }
  } catch (error) {
    console.warn(`[prettier] Skipped ${file}: ${error.message}`);
  }
}

if (formatted.length === 0) process.exit(0);

const stageError = tryRun('git', ['add', ...formatted]);
if (stageError && (stageError.code === 'EPERM' || stageError.errno === 'EPERM')) {
  console.error('[prettier] Formatted files; please stage changes manually and re-commit.');
  process.exit(1);
}
if (stageError) throw stageError;

console.log(`[prettier] Formatted ${formatted.length} staged file(s).`);
