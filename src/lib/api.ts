export type GenerateFormRequest = { prompt: string; imageUri: string; imageUri2?: string; idToken: string };
export type GenerateResponse = { ok: boolean; data: null | { message: string; images: { url: string; fileName: string }[] }; error?: string };

const BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

async function uriToBlob(uri: string): Promise<Blob> {
  // Works on web; on native FormData can take file descriptor object instead
  const res = await fetch(uri);
  return await res.blob();
}

export async function generateStyles(req: GenerateFormRequest): Promise<GenerateResponse> {
  const url = `${BASE}/generate`;
  const form = new FormData();
  form.append('prompt', req.prompt);
  // On native, append with file descriptor; on web, append Blob
  const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
  if (isWeb) {
    const blob1 = await uriToBlob(req.imageUri);
    form.append('image1', blob1, 'image1.jpg');
    if (req.imageUri2) {
      const blob2 = await uriToBlob(req.imageUri2);
      form.append('image2', blob2, 'image2.jpg');
    }
  } else {
    // React Native
    form.append('image1', { uri: req.imageUri, name: 'image1.jpg', type: 'image/jpeg' } as any);
    if (req.imageUri2) form.append('image2', { uri: req.imageUri2, name: 'image2.jpg', type: 'image/jpeg' } as any);
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: req.idToken },
    body: form,
  });
  if (!res.ok) throw new Error('Failed to generate');
  return res.json();
}

export type PurchasePayload = { sku: string; receipt?: string; platform: 'android' | 'web' };
export async function confirmPurchase(payload: PurchasePayload) {
  const url = `${BASE}/purchase`;
  await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function sendFeedback(message: string) {
  const url = `${BASE}/feedback`;
  const body = { message };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('Failed to send feedback');
}

export async function getSessionCredits(idToken: string): Promise<number> {
  const url = `${BASE}/session`;
  const res = await fetch(url, { method: 'POST', headers: { Authorization: idToken } });
  if (!res.ok) throw new Error('Failed to fetch session');
  const data = await res.json();
  return data?.credits ?? 0;
}
