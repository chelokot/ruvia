export function getApiBase(): string {
  // Resolve runtime API base, allowing explicit override via env
  const envBase = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim();

  // Always honor explicit env override when provided
  if (envBase) return envBase;

  if (typeof window === 'undefined') return envBase;

  const host = window.location.host; // e.g., www.ruvia.art or branch.ruvia.art
  if (host === 'ruvia.art' || host === 'www.ruvia.art') return 'https://api.ruvia.art';
  if (host.endsWith('.ruvia.art')) {
    // For preview branches like feature-x.ruvia.art -> api-feature-x.ruvia.art
    return `https://api-${host}`;
  }
  // Fallback to production API
  return 'https://api.ruvia.art';
}
