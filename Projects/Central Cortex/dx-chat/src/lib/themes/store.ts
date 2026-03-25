import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DXSkin } from './types';
import { BUILTIN_SKINS, DARK_PRO } from './builtin';
import { applyTheme } from './engine';

interface ThemeStore {
  /** ID of the currently active skin */
  activeSkinId: string;
  /** Community skins installed by the user */
  communitySkins: DXSkin[];
  /** Get all skins (builtin + community) */
  allSkins: () => DXSkin[];
  /** Get the active skin object */
  activeSkin: () => DXSkin;
  /** Apply and persist a skin by ID */
  setSkin: (id: string) => void;
  /** Install a community skin */
  installSkin: (skin: DXSkin) => void;
  /** Remove a community skin by ID */
  removeSkin: (id: string) => void;
  /** Reapply the active theme (call on mount to restore persisted theme) */
  reapply: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      activeSkinId: DARK_PRO.id,
      communitySkins: [],

      allSkins: () => [...BUILTIN_SKINS, ...get().communitySkins],

      activeSkin: () => {
        const { activeSkinId, communitySkins } = get();
        return (
          BUILTIN_SKINS.find((s) => s.id === activeSkinId) ||
          communitySkins.find((s) => s.id === activeSkinId) ||
          DARK_PRO
        );
      },

      setSkin: (id: string) => {
        const skin = get().allSkins().find((s) => s.id === id);
        if (!skin) return;
        set({ activeSkinId: id });
        applyTheme(skin);
      },

      installSkin: (skin: DXSkin) => {
        set((state) => ({
          communitySkins: [...state.communitySkins, skin],
        }));
      },

      removeSkin: (id: string) => {
        set((state) => {
          const updated = state.communitySkins.filter((s) => s.id !== id);
          const wasActive = state.activeSkinId === id;
          return {
            communitySkins: updated,
            activeSkinId: wasActive ? DARK_PRO.id : state.activeSkinId,
          };
        });
        // If removed skin was active, reapply default
        if (get().activeSkinId === DARK_PRO.id) {
          applyTheme(DARK_PRO);
        }
      },

      reapply: () => {
        const skin = get().activeSkin();
        applyTheme(skin);
      },
    }),
    {
      name: 'dx-chat-theme',
      partialize: (state) => ({
        activeSkinId: state.activeSkinId,
        communitySkins: state.communitySkins,
      }),
    },
  ),
);
