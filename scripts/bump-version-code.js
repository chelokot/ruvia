const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const app = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const current = app?.expo?.android?.versionCode ?? 1;
const next = current + 1;
app.expo.android.versionCode = next;

fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + '\n');

// Also bump android/app/build.gradle if present so local dev builds match
try {
  const gradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
  let gradle = fs.readFileSync(gradlePath, 'utf8');
  gradle = gradle.replace(/versionCode\s+\d+/g, `versionCode ${next}`);
  fs.writeFileSync(gradlePath, gradle);
  execSync('git add android/app/build.gradle', { stdio: 'ignore' });
} catch {}

execSync('git add app.json');
console.log(`Android versionCode bumped to ${next}`);
