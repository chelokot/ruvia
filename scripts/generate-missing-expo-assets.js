#!/usr/bin/env node
// Create missing Expo config image assets if absent: icon.png, splash.png, notification-icon.png
const fs = require('fs');
const path = require('path');

async function ensureSharp() {
  try {
    return require('sharp');
  } catch (e) {
    const cp = require('child_process');
    console.log('Installing sharp...');
    cp.execSync('npm i --no-audit --no-fund sharp@^0.33.0', { stdio: 'inherit' });
    return require('sharp');
  }
}

async function makePng(p, w, h, color = '#000000') {
  const sharp = await ensureSharp();
  await sharp({ create: { width: w, height: h, channels: 4, background: color } })
    .png()
    .toFile(p);
  console.log('Created', p, `${w}x${h}`);
}

async function main() {
  const assetsDir = path.join(process.cwd(), 'assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  const iconPath = path.join(assetsDir, 'icon.png');
  const splashPath = path.join(assetsDir, 'splash.png');
  const notifPath = path.join(assetsDir, 'notification-icon.png');

  if (!fs.existsSync(iconPath)) await makePng(iconPath, 1024, 1024, '#111111');
  if (!fs.existsSync(splashPath)) await makePng(splashPath, 2048, 2048, '#000000');
  if (!fs.existsSync(notifPath)) await makePng(notifPath, 96, 96, '#ffffff');
}

main().catch((e) => { console.error(e); process.exit(1); });

