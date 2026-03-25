import JSZip from 'jszip';
import type { DXSkin, DXSkinFile, DXSkinTokens } from './types';
import { DARK_PRO } from './builtin';

/**
 * Maps a token key to its full CSS custom property name.
 * e.g. 'bg-primary' → '--color-aim-bg-primary'
 */
function tokenToCssVar(key: string): string {
  if (key === 'shadow-glow') return '--shadow-glow';
  return `--color-aim-${key}`;
}

/**
 * Apply a skin's tokens to the document root (or a preview target element).
 * Inline styles on :root override Tailwind's @theme CSS vars.
 */
export function applyTheme(skin: DXSkin, target: HTMLElement = document.documentElement): void {
  const tokens = skin.tokens as unknown as Record<string, string | undefined>;
  for (const [key, value] of Object.entries(tokens)) {
    if (value !== undefined) {
      target.style.setProperty(tokenToCssVar(key), value);
    }
  }
  // Set color-scheme for browser chrome (scrollbars, input borders, etc.)
  target.style.setProperty('color-scheme', skin.colorScheme);
}

/**
 * Remove all theme overrides from an element, reverting to @theme defaults.
 */
export function clearThemeOverrides(target: HTMLElement = document.documentElement): void {
  const defaultTokens = DARK_PRO.tokens as unknown as Record<string, string | undefined>;
  for (const key of Object.keys(defaultTokens)) {
    target.style.removeProperty(tokenToCssVar(key));
  }
  target.style.removeProperty('color-scheme');
}

/**
 * Parse a .dxskin zip file (ArrayBuffer) into a DXSkin object.
 * .dxskin format: ZIP containing skin.json at root.
 */
export async function loadSkinFromZip(buffer: ArrayBuffer, installedAt?: string): Promise<DXSkin> {
  const zip = await JSZip.loadAsync(buffer);
  const skinFile = zip.file('skin.json');
  if (!skinFile) {
    throw new Error('.dxskin file is missing skin.json');
  }
  const json = await skinFile.async('string');
  const data: DXSkinFile = JSON.parse(json);

  if (!data.name || !data.tokens) {
    throw new Error('Invalid skin.json: missing required fields (name, tokens)');
  }

  // Validate that all required token keys are present
  const requiredKeys: (keyof DXSkinTokens)[] = [
    'bg-primary', 'bg-secondary', 'bg-surface', 'border', 'text-primary', 'accent',
  ];
  for (const key of requiredKeys) {
    if (!data.tokens[key]) {
      throw new Error(`Invalid skin.json: missing required token "${key}"`);
    }
  }

  // Merge with Dark Pro defaults for any missing tokens
  const merged: DXSkinTokens = {
    ...DARK_PRO.tokens,
    ...data.tokens,
  };

  return {
    id: `community-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: data.name,
    author: data.author || 'Unknown',
    version: data.version || '1.0.0',
    description: data.description || '',
    colorScheme: data.colorScheme || 'dark',
    tokens: merged,
    builtin: false,
    installedAt: installedAt || new Date().toISOString(),
  };
}

/**
 * Export a DXSkin as a .dxskin zip file and trigger browser download.
 */
export async function exportSkinToZip(skin: DXSkin): Promise<void> {
  const zip = new JSZip();
  const skinFile: DXSkinFile = {
    name: skin.name,
    author: skin.author,
    version: skin.version,
    description: skin.description,
    colorScheme: skin.colorScheme,
    tokens: skin.tokens,
  };
  zip.file('skin.json', JSON.stringify(skinFile, null, 2));

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${skin.name.replace(/\s+/g, '-').toLowerCase()}.dxskin`;
  a.click();
  URL.revokeObjectURL(url);
}
