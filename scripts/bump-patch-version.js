const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function bumpPatch(version) {
  if (typeof version !== 'string') return null;
  // Strip pre-release/build metadata for bumping
  const core = version.split('-')[0].split('+')[0];
  const parts = core.split('.');
  if (parts.length !== 3) return null;
  const [maj, min, pat] = parts.map((x) => Number(x));
  if ([maj, min, pat].some(Number.isNaN)) return null;
  return `${maj}.${min}.${pat + 1}`;
}

function stage(file) {
  try { execSync(`git add ${JSON.stringify(file)}`); } catch {}
}

const root = path.join(__dirname, '..');

// 1) app.json (Expo)
try {
  const appJsonPath = path.join(root, 'app.json');
  const app = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const current = app?.expo?.version;
  const next = bumpPatch(current);
  if (next) {
    app.expo.version = next;
    fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + '\n');
    stage(appJsonPath);
    console.log(`[version] app.json expo.version: ${current} -> ${next}`);
  } else {
    console.warn(`[version] app.json expo.version not bumped (unrecognized): ${current}`);
  }
} catch (e) {
  console.warn('[version] Skipping app.json bump:', e.message);
}

// 2) package.json (keep in sync)
try {
  const pkgPath = path.join(root, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const current = pkg?.version;
  const next = bumpPatch(current);
  if (next) {
    pkg.version = next;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    stage(pkgPath);
    console.log(`[version] package.json version: ${current} -> ${next}`);
  } else {
    console.warn(`[version] package.json version not bumped (unrecognized): ${current}`);
  }
} catch (e) {
  console.warn('[version] Skipping package.json bump:', e.message);
}

// 3) android/app/build.gradle versionName (for local native builds)
try {
  const gradlePath = path.join(root, 'android', 'app', 'build.gradle');
  let gradle = fs.readFileSync(gradlePath, 'utf8');
  const m = gradle.match(/versionName\s+"(\d+)\.(\d+)\.(\d+)"/);
  if (m) {
    const current = `${m[1]}.${m[2]}.${m[3]}`;
    const next = bumpPatch(current);
    if (next) {
      gradle = gradle.replace(/versionName\s+"(\d+)\.(\d+)\.(\d+)"/g, `versionName "${next}"`);
      fs.writeFileSync(gradlePath, gradle);
      stage(gradlePath);
      console.log(`[version] android/app/build.gradle versionName: ${current} -> ${next}`);
    }
  }
} catch {}

