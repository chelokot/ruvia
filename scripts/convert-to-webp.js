#!/usr/bin/env node
/*
  Batch-convert all JPG/JPEG images in the `assets` directory to 512x512 WebP.
  - Keeps originals intact, writes .webp alongside them
  - Skips if the .webp already exists
*/

const fs = require('fs');
const path = require('path');

async function ensureSharp() {
  try {
    return require('sharp');
  } catch (e) {
    console.error('Dependency `sharp` not installed. Installing...');
    const cp = require('child_process');
    cp.execSync('npm i --no-audit --no-fund sharp@^0.33.0', { stdio: 'inherit' });
    return require('sharp');
  }
}

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function isJpgLike(p) {
  return /\.(jpe?g)$/i.test(p);
}

async function main() {
  const sharp = await ensureSharp();
  const root = path.resolve(__dirname, '..', 'assets');
  if (!fs.existsSync(root)) {
    console.error('Assets directory not found at', root);
    process.exit(1);
  }

  const files = walk(root).filter(isJpgLike);
  console.log(`Found ${files.length} JPG files.`);

  let converted = 0;
  for (const input of files) {
    const parsed = path.parse(input);
    const output = path.join(parsed.dir, parsed.name + '.webp');
    if (fs.existsSync(output)) {
      continue; // already converted
    }
    try {
      await sharp(input)
        .resize(512, 512, { fit: 'cover', position: 'centre' })
        .webp({ quality: 80 })
        .toFile(output);
      converted++;
      if (converted % 10 === 0) {
        console.log(`Converted ${converted}/${files.length}...`);
      }
    } catch (err) {
      console.error('Failed to convert', input, err.message);
    }
  }
  console.log(`Done. Created ${converted} WebP files.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

