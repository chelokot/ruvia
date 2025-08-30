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

// Generated data for Single/Male lives in styles.generated.ts
// eslint-disable-next-line @typescript-eslint/no-var-requires
const generated = require('./styles.generated');

export const STYLE_ROWS: StyleRow[] = (generated.STYLE_ROWS_DATA ?? []) as unknown as StyleRow[];
