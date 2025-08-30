export type GenerateRequest = { imageBase64: string; prompts: string[]; mode: 'single' | 'dual'; variant: string };
export type GenerateResponse = { results: string[] }; // base64 images

const BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export async function generateStyles(body: GenerateRequest): Promise<GenerateResponse> {
  // Backend not ready; implement but do not test network here.
  const url = `${BASE}/generate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to generate');
  return res.json();
}

export type PurchasePayload = { sku: string; receipt?: string; platform: 'android' | 'web' };
export async function confirmPurchase(payload: PurchasePayload) {
  const url = `${BASE}/purchase`;
  await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

