#!/usr/bin/env node
const { execSync } = require('child_process');

function out(cmd) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim();
}
function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

// Collect staged files
let files = out('git diff --name-only --cached');
if (!files) process.exit(0);

const exts = [
  '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.css', '.scss', '.yml', '.yaml', '.html', '.cjs', '.mjs'
];

const list = files
  .split('\n')
  .filter((f) => exts.some((e) => f.endsWith(e)))
  .filter((f) => !/node_modules\//.test(f));

if (list.length === 0) process.exit(0);

// Run prettier on chunks to avoid long command lines
const chunkSize = 50;
for (let i = 0; i < list.length; i += chunkSize) {
  const chunk = list.slice(i, i + chunkSize);
  const args = chunk.map((f) => JSON.stringify(f)).join(' ');
  run(`npx --no prettier --write ${args}`);
}

// Re-stage files after formatting
run('git add ' + list.map((f) => JSON.stringify(f)).join(' '));

console.log(`[prettier] Formatted ${list.length} staged file(s).`);
