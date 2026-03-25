import { get, set } from 'idb-keyval';

const KEY_STORE_NAME = 'dx-chat-enc-key';

let encKey: CryptoKey | null = null;

async function getOrCreateKey(): Promise<CryptoKey> {
  if (encKey) return encKey;

  const stored = await get<ArrayBuffer>(KEY_STORE_NAME);
  if (stored) {
    encKey = await crypto.subtle.importKey(
      'raw',
      stored,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt'],
    );
    return encKey;
  }

  // Generate and persist a new key
  const raw = crypto.getRandomValues(new Uint8Array(32));
  await set(KEY_STORE_NAME, raw.buffer);
  encKey = await crypto.subtle.importKey(
    'raw',
    raw.buffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt'],
  );
  return encKey;
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  const combined = new Uint8Array(12 + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), 12);

  // Convert to base64
  let binary = '';
  combined.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export async function decrypt(ciphertextBase64: string): Promise<string> {
  const key = await getOrCreateKey();
  const binary = atob(ciphertextBase64);
  const combined = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) combined[i] = binary.charCodeAt(i);

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}
