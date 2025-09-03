const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const app = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const current = app?.expo?.android?.versionCode ?? 1;
app.expo.android.versionCode = current + 1;

fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + '\n');

execSync('git add app.json');
console.log(`Android versionCode bumped to ${app.expo.android.versionCode}`);
