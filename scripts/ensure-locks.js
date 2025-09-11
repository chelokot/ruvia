#!/usr/bin/env node
const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function tryRun(cmd, opts = {}) {
  try {
    execSync(cmd, { stdio: 'pipe', ...opts });
    return true;
  } catch {
    return false;
  }
}

function ensureLock(dir) {
  const cwd = path.resolve(dir);
  const prefix = dir === '.' ? '[root]' : `[${dir}]`;
  const ciCmd = 'npm ci --silent --ignore-scripts --dry-run';
  const installCmd = 'npm i --no-audit --no-fund';

  process.stdout.write(`${prefix} Checking lockfile with: ${ciCmd}\n`);
  if (tryRun(ciCmd, { cwd })) {
    console.log(`${prefix} Lockfile OK`);
    return true;
  }

  console.log(`${prefix} Lockfile mismatch. Running: ${installCmd}`);
  run(installCmd, { cwd });

  // stage updated lockfile if in a git repo
  try {
    run('git add package-lock.json', { cwd });
    console.log(`${prefix} Staged updated package-lock.json`);
  } catch {}

  if (tryRun(ciCmd, { cwd })) {
    console.log(`${prefix} Lockfile fixed`);
    return true;
  }

  console.error(`${prefix} Lockfile still inconsistent after npm i`);
  return false;
}

let ok = ensureLock('.')
if (existsSync('backend/package.json')) {
  ok = ensureLock('backend') && ok;
}

if (!ok) {
  process.exit(1);
}

