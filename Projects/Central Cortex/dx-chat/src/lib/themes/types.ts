/**
 * DX-Chat Skinning / Theming Engine — Types
 * Winamp-style community skin system with CSS variable overrides
 */

/** All overridable CSS token keys (maps to --color-aim-<key>) */
export interface DXSkinTokens {
  // Backgrounds
  'bg-primary': string;
  'bg-secondary': string;
  'bg-tertiary': string;
  'bg-surface': string;
  'bg-elevated': string;
  'bg-input': string;
  // Borders
  'border': string;
  'border-subtle': string;
  'border-focus': string;
  // Text
  'text-primary': string;
  'text-secondary': string;
  'text-muted': string;
  'text-inverse': string;
  // Accents
  'accent': string;
  'accent-hover': string;
  'accent-subtle': string;
  'yellow': string;
  'yellow-hover': string;
  'green': string;
  'green-subtle': string;
  'red': string;
  'red-subtle': string;
  'orange': string;
  // Status
  'online': string;
  'away': string;
  'offline': string;
  // Bubbles
  'bubble-user': string;
  'bubble-agent': string;
  // Glow shadow (optional override)
  'shadow-glow'?: string;
}

/** A complete skin definition */
export interface DXSkin {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  colorScheme: 'dark' | 'light';
  tokens: DXSkinTokens;
  /** True for built-in skins that can't be deleted */
  builtin?: boolean;
  /** ISO timestamp when skin was installed */
  installedAt?: string;
}

/** The skin.json format inside a .dxskin zip */
export interface DXSkinFile {
  name: string;
  author: string;
  version: string;
  description: string;
  colorScheme?: 'dark' | 'light';
  tokens: DXSkinTokens;
}
