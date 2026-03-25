import type { DXSkin } from './types';

/**
 * AIM Classic — Light theme. The original AOL Instant Messenger look.
 * Evokes Windows XP, gray system chrome, AIM's iconic blue/yellow palette.
 */
export const AIM_CLASSIC: DXSkin = {
  id: 'aim-classic',
  name: 'AIM Classic',
  author: 'DX-Chat',
  version: '1.0.0',
  description: 'The original AOL Instant Messenger aesthetic. Light theme with classic blue accents.',
  colorScheme: 'light',
  builtin: true,
  tokens: {
    'bg-primary': '#e8e8e8',
    'bg-secondary': '#f0f0f0',
    'bg-tertiary': '#d0d8e8',
    'bg-surface': '#ffffff',
    'bg-elevated': '#f8f8f8',
    'bg-input': '#ffffff',
    'border': '#aab4c8',
    'border-subtle': '#c8d0dc',
    'border-focus': '#0066cc',
    'text-primary': '#1a1a2e',
    'text-secondary': '#444466',
    'text-muted': '#7788aa',
    'text-inverse': '#ffffff',
    'accent': '#0066cc',
    'accent-hover': '#0055aa',
    'accent-subtle': '#0066cc20',
    'yellow': '#e8a000',
    'yellow-hover': '#cc8800',
    'green': '#008844',
    'green-subtle': '#00884420',
    'red': '#cc2244',
    'red-subtle': '#cc224420',
    'orange': '#cc5500',
    'online': '#008844',
    'away': '#e8a000',
    'offline': '#7788aa',
    'bubble-user': '#ddeeff',
    'bubble-agent': '#ffffff',
    'shadow-glow': '0 0 12px rgba(0, 102, 204, 0.2)',
  },
};

/**
 * Dark Pro — The default dark theme, refined.
 * Deep navy blues, cyan accents, premium dark UI feel.
 */
export const DARK_PRO: DXSkin = {
  id: 'dark-pro',
  name: 'Dark Pro',
  author: 'DX-Chat',
  version: '1.0.0',
  description: 'Premium dark mode. Deep navy backgrounds with cyan accents.',
  colorScheme: 'dark',
  builtin: true,
  tokens: {
    'bg-primary': '#1a1a2e',
    'bg-secondary': '#16213e',
    'bg-tertiary': '#0f3460',
    'bg-surface': '#1e2746',
    'bg-elevated': '#243b6a',
    'bg-input': '#162038',
    'border': '#2a3f6e',
    'border-subtle': '#1e2d52',
    'border-focus': '#00b4d8',
    'text-primary': '#e0e6ef',
    'text-secondary': '#8892a8',
    'text-muted': '#5a6480',
    'text-inverse': '#0a0a1a',
    'accent': '#00b4d8',
    'accent-hover': '#0096c7',
    'accent-subtle': '#00b4d820',
    'yellow': '#ffd60a',
    'yellow-hover': '#ffc800',
    'green': '#06d6a0',
    'green-subtle': '#06d6a020',
    'red': '#ef476f',
    'red-subtle': '#ef476f20',
    'orange': '#ff8c42',
    'online': '#06d6a0',
    'away': '#ffd60a',
    'offline': '#5a6480',
    'bubble-user': '#0f3460',
    'bubble-agent': '#1e2746',
    'shadow-glow': '0 0 12px rgba(0, 180, 216, 0.3)',
  },
};

/**
 * Neon Night — Cyberpunk / synthwave aesthetic.
 * Near-black backgrounds, hot neon accents, electric borders.
 */
export const NEON_NIGHT: DXSkin = {
  id: 'neon-night',
  name: 'Neon Night',
  author: 'DX-Chat',
  version: '1.0.0',
  description: 'Cyberpunk neon aesthetic. Near-black backgrounds with electric magenta and cyan.',
  colorScheme: 'dark',
  builtin: true,
  tokens: {
    'bg-primary': '#0a0a0f',
    'bg-secondary': '#0e0e18',
    'bg-tertiary': '#14142a',
    'bg-surface': '#12121e',
    'bg-elevated': '#1a1a2e',
    'bg-input': '#0c0c16',
    'border': '#2a0a4a',
    'border-subtle': '#1a082e',
    'border-focus': '#ff00ff',
    'text-primary': '#e8e0ff',
    'text-secondary': '#9988cc',
    'text-muted': '#5544aa',
    'text-inverse': '#0a0a0f',
    'accent': '#ff00ff',
    'accent-hover': '#dd00dd',
    'accent-subtle': '#ff00ff18',
    'yellow': '#ffff00',
    'yellow-hover': '#dddd00',
    'green': '#00ff88',
    'green-subtle': '#00ff8818',
    'red': '#ff2266',
    'red-subtle': '#ff226618',
    'orange': '#ff6600',
    'online': '#00ff88',
    'away': '#ffff00',
    'offline': '#5544aa',
    'bubble-user': '#1a0a3a',
    'bubble-agent': '#12121e',
    'shadow-glow': '0 0 16px rgba(255, 0, 255, 0.4)',
  },
};

export const BUILTIN_SKINS: DXSkin[] = [AIM_CLASSIC, DARK_PRO, NEON_NIGHT];
