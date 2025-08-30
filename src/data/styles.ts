export type StyleItem = {
  id: string;
  name: string;
  prompt: string;
  image: any; // require('...')
};

export type StyleRow = {
  id: string;
  title: string;
  items: StyleItem[];
};

// Generated data lives in styles.generated.ts
// eslint-disable-next-line @typescript-eslint/no-var-requires
const generated = require('./styles.generated');

// Map of "Mode/Variant" to rows
export const STYLE_SETS: Record<string, StyleRow[]> = (generated.STYLE_SETS ?? {}) as Record<string, StyleRow[]>;

// Default dataset (for backward compatibility)
export const STYLE_ROWS: StyleRow[] = (generated.STYLE_ROWS_DATA ?? []) as StyleRow[];

export function getStyleRowsByKey(key?: string): StyleRow[] {
  if (!key) return STYLE_ROWS;
  const rows = STYLE_SETS[key];
  if (rows && rows.length) return rows;
  // Fallback to default
  return STYLE_ROWS;
}
