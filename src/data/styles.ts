export type StyleItem = {
  id: string;
  name: string;
  prompt: string;
  color: string; // placeholder visual
};

export type StyleRow = {
  id: string;
  title: string;
  items: StyleItem[];
};

function gen(prefix: string, color: string, count = 10): StyleItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    name: `${prefix} ${i + 1}`,
    prompt: `Prompt for ${prefix} ${i + 1}`,
    color,
  }));
}

export const STYLE_ROWS: StyleRow[] = [
  { id: 'modern', title: 'Modern', items: gen('Modern', '#2dd4bf') },
  { id: 'classic', title: 'Classic', items: gen('Classic', '#f59e0b') },
  { id: 'artistic', title: 'Artistic', items: gen('Art', '#a78bfa') },
];

