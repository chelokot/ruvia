export function getApiBase(): string {
  // Runtime URL resolver for web preview/prod and native/dev fallbacks
  const envBase = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
  if (typeof window === 'undefined') return envBase;

  const host = window.location.host; // e.g., branch.ruvia.art or ruvia.art
  if (host === 'ruvia.art') return 'https://api.ruvia.art';
  if (host.endsWith('.ruvia.art')) {
    return `https://api-${host}`; // api-branch.ruvia.art
  }
  // Default to env for local/dev or custom domains
  return envBase;
}

