/*
  Codegen: scans assets/styles for modes and variants and builds src/data/styles.generated.ts
  Structure example (Single/Male shown):
    assets/styles/Single/prompt.txt                (mode-level)
    assets/styles/Single/Male/prompt.txt           (variant-level)
    assets/styles/Single/Male/<order> <Category>/prompt.txt (category-level, may include $name)
    assets/styles/Single/Male/<order> <Category>/<order> <Element>/image.(jpg|png)
    assets/styles/Single/Male/<order> <Category>/<order> <Element>/prompt.txt

  Placeholders:
    $internal -> replaced with nested prompt down the chain
    $name     -> replaced with element display name (used in category-level prompt)

  Output:
    - STYLE_SETS: Record of "<Mode>/<Variant>" -> rows[]
    - STYLE_ROWS_DATA: default rows = STYLE_SETS['Single/Male'] or []
*/

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const OUT_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'styles.generated.ts');

function readTextSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8').trim();
  } catch (_) {
    return '';
  }
}

function replaceAll(target, search, replace) {
  return target.split(search).join(replace);
}

function replaceInternal(outer, inner) {
  return outer.replace(/\$internal/g, inner);
}

function toId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function stripOrderPrefix(dirName) {
  // Remove leading numeric prefix and a space, e.g., "0 Photo Shootings" -> "Photo Shootings"
  const m = dirName.match(/^\s*\d+\s+(.*)$/);
  return m ? m[1] : dirName;
}

function findImageFile(dir) {
  const candidates = ['image.jpg', 'image.jpeg', 'image.png', 'thumb.jpg', 'thumb.png'];
  for (const c of candidates) {
    const p = path.join(dir, c);
    if (fs.existsSync(p)) return p;
  }
  // Fallback: first image file in dir
  const files = fs.readdirSync(dir);
  const img = files.find((f) => /\.(jpe?g|png)$/i.test(f));
  return img ? path.join(dir, img) : null;
}

function listOrderedDirectories(root) {
  const ents = fs.readdirSync(root, { withFileTypes: true });
  const dirs = ents.filter((e) => e.isDirectory()).map((e) => e.name);
  // sort by numeric prefix if present
  dirs.sort((a, b) => {
    const ma = a.match(/^(\d+)/);
    const mb = b.match(/^(\d+)/);
    const na = ma ? parseInt(ma[1], 10) : Number.MAX_SAFE_INTEGER;
    const nb = mb ? parseInt(mb[1], 10) : Number.MAX_SAFE_INTEGER;
    if (na !== nb) return na - nb;
    return a.localeCompare(b);
  });
  return dirs;
}

function buildVariant(modeRoot, modeName, variantName) {
  const variantRoot = path.join(modeRoot, variantName);
  if (!fs.existsSync(variantRoot)) return null;
  const modePrompt = readTextSafe(path.join(modeRoot, 'prompt.txt'));
  const variantPrompt = readTextSafe(path.join(variantRoot, 'prompt.txt'));

  const categories = listOrderedDirectories(variantRoot);
  const rows = [];
  for (const catDirName of categories) {
    const catDir = path.join(variantRoot, catDirName);
    const catPrompt = readTextSafe(path.join(catDir, 'prompt.txt'));
    const title = stripOrderPrefix(catDirName);
    const rowId = toId(title);

    const elements = listOrderedDirectories(catDir);
    const items = [];
    for (const elDirName of elements) {
      const elDir = path.join(catDir, elDirName);
      const name = stripOrderPrefix(elDirName);
      const id = toId(name);
      const elPrompt = readTextSafe(path.join(elDir, 'prompt.txt'));
      const imagePathAbs = findImageFile(elDir);
      if (!imagePathAbs) continue;
      const relFromOut = path.relative(path.dirname(OUT_FILE), imagePathAbs).split(path.sep).join('/');

      // Compose prompt chain: Mode -> Variant -> Category(name) -> Element
      const catWithName = catPrompt.replace(/\$name/g, name);
      const chain1 = replaceInternal(variantPrompt, catWithName);
      const chain2 = replaceInternal(modePrompt, chain1);
      const finalPrompt = replaceInternal(chain2, elPrompt);

      items.push({ id, name, prompt: finalPrompt, imageReq: `require('${relFromOut}')` });
    }
    rows.push({ id: rowId, title, items });
  }
  return rows;
}

function buildAll() {
  const stylesRoot = path.join(PROJECT_ROOT, 'assets', 'styles');
  if (!fs.existsSync(stylesRoot)) throw new Error(`Missing directory: ${stylesRoot}`);
  const modes = fs.readdirSync(stylesRoot).filter((d) => fs.statSync(path.join(stylesRoot, d)).isDirectory());

  const sets = {}; // key: `${mode}/${variant}` -> rows

  for (const modeName of modes) {
    const modeRoot = path.join(stylesRoot, modeName);
    const variants = fs.readdirSync(modeRoot).filter((d) => fs.statSync(path.join(modeRoot, d)).isDirectory());
    for (const variantName of variants) {
      const rows = buildVariant(modeRoot, modeName, variantName) || [];
      sets[`${modeName}/${variantName}`] = rows;
    }
  }

  // Default rows: Single/Male if exists else first available else []
  const defaultKey = 'Single/Male';
  let defaultRows = sets[defaultKey];
  if (!defaultRows) {
    const keys = Object.keys(sets);
    defaultRows = keys.length ? sets[keys[0]] : [];
  }

  const lines = [];
  lines.push('// AUTO-GENERATED FILE. Do not edit manually.');
  lines.push('// Generated by scripts/generate-styles.js');
  lines.push('');
  // STYLE_SETS
  lines.push('export const STYLE_SETS = {');
  for (const [key, rows] of Object.entries(sets)) {
    lines.push(`  ${JSON.stringify(key)}: [`);
    for (const row of rows) {
      lines.push(`    { id: ${JSON.stringify(row.id)}, title: ${JSON.stringify(row.title)}, items: [`);
      for (const item of row.items) {
        lines.push('      {');
        lines.push(`        id: ${JSON.stringify(item.id)},`);
        lines.push(`        name: ${JSON.stringify(item.name)},`);
        lines.push(`        prompt: ${JSON.stringify(item.prompt)},`);
        lines.push(`        image: ${item.imageReq},`);
        lines.push('      },');
      }
      lines.push('    ] },');
    }
    lines.push('  ],');
  }
  lines.push('} as const;');
  lines.push('');
  // Default export for existing code
  lines.push('export const STYLE_ROWS_DATA = STYLE_SETS["Single/Male"] ?? [];');
  lines.push('');

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, lines.join('\n'));
  console.log(`Wrote ${OUT_FILE}`);
}

buildAll();
