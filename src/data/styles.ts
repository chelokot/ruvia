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

function toId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function makeItems(names: string[], color: string): StyleItem[] {
  return names.map((name) => ({ id: toId(name), name, prompt: `Prompt for ${name}`, color }));
}

export const STYLE_ROWS: StyleRow[] = [
  {
    id: 'photo-shootings',
    title: 'Photo Shootings',
    items: makeItems(
      [
        'Classic Fashion',
        'Monochrome',
        'Motion',
        'Snaps',
        'Album Cover',
        'Candy Dream',
        'Paparazzi',
        'Y2K',
      ],
      '#2dd4bf'
    ),
  },
  {
    id: 'common-things',
    title: 'Common Things',
    items: makeItems(
      [
        'Office Siren',
        'Gym',
        'Neighbor',
        'Travel',
        'Beach Holiday',
        'Film',
      ],
      '#f59e0b'
    ),
  },
  {
    id: 'luxury',
    title: 'Luxury',
    items: makeItems(['New Money', 'Hotel', 'Big City', 'Yacht', 'Red Carpet'], '#a78bfa'),
  },
  {
    id: 'time-machine',
    title: 'Time Machine',
    items: makeItems(['Regency Era', 'Roaring Twenties', 'Vikings', 'Egypt', 'Royal'], '#10b981'),
  },
  {
    id: 'trendy',
    title: 'Trendy',
    items: makeItems(
      ['Coquette Core', 'Fashion Pregnancy', 'Office Core', 'Be Mine', 'Marvelous Creation'],
      '#ef4444'
    ),
  },
  {
    id: 'mistery',
    title: 'Mistery',
    items: makeItems(['Cyberpunk', 'Elves', 'Enchanted Fairies', 'Game'], '#3b82f6'),
  },
];
