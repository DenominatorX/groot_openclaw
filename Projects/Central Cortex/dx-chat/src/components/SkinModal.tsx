import React, { useRef, useState } from 'react';
import { X, Palette, Upload, Download, Trash2, Check, Eye } from 'lucide-react';
import { useThemeStore } from '../lib/themes/store';
import { loadSkinFromZip, exportSkinToZip, applyTheme } from '../lib/themes/engine';
import type { DXSkin } from '../lib/themes/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SkinModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { activeSkinId, allSkins, setSkin, installSkin, removeSkin, activeSkin } = useThemeStore();
  const [previewSkinId, setPreviewSkinId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const skins = allSkins();

  const handlePreviewEnter = (skin: DXSkin) => {
    setPreviewSkinId(skin.id);
    applyTheme(skin);
  };

  const handlePreviewLeave = () => {
    setPreviewSkinId(null);
    // Restore the actual active skin
    applyTheme(activeSkin());
  };

  const handleApply = (id: string) => {
    setPreviewSkinId(null);
    setSkin(id);
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.dxskin')) {
      setImportError('File must be a .dxskin file');
      return;
    }
    setImporting(true);
    setImportError(null);
    try {
      const buffer = await file.arrayBuffer();
      const skin = await loadSkinFromZip(buffer);
      installSkin(skin);
    } catch (err) {
      setImportError((err as Error).message);
    } finally {
      setImporting(false);
      // Reset so same file can be re-imported
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExport = async (skin: DXSkin) => {
    await exportSkinToZip(skin);
  };

  const handleClose = () => {
    // If previewing, restore active skin before closing
    if (previewSkinId) {
      setPreviewSkinId(null);
      applyTheme(activeSkin());
    }
    onClose();
  };

  const builtinSkins = skins.filter((s) => s.builtin);
  const communitySkins = skins.filter((s) => !s.builtin);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-aim-bg-secondary border border-aim-border rounded-[--radius-lg] shadow-lg w-full max-w-2xl max-h-[85vh] flex flex-col"
        onMouseLeave={handlePreviewLeave}
      >
        {/* Header */}
        <div className="p-4 border-b border-aim-border flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Palette size={18} className="text-aim-accent" />
            <h2 className="font-bold text-[length:--font-size-base] text-aim-text-primary">
              Skins & Themes
            </h2>
            {previewSkinId && (
              <span className="flex items-center gap-1 text-[length:--font-size-xs] text-aim-accent bg-aim-accent-subtle px-2 py-0.5 rounded-full">
                <Eye size={11} />
                Previewing
              </span>
            )}
          </div>
          <button
            className="p-1.5 hover:bg-aim-bg-surface rounded-[--radius-sm] text-aim-text-muted hover:text-aim-text-primary transition-colors"
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Built-in Themes */}
          <section>
            <h3 className="text-[length:--font-size-xs] font-semibold uppercase tracking-wider text-aim-text-muted mb-3">
              Built-in Themes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {builtinSkins.map((skin) => (
                <SkinCard
                  key={skin.id}
                  skin={skin}
                  isActive={activeSkinId === skin.id}
                  isPreviewing={previewSkinId === skin.id}
                  onPreviewEnter={() => handlePreviewEnter(skin)}
                  onApply={() => handleApply(skin.id)}
                  onExport={() => handleExport(skin)}
                />
              ))}
            </div>
          </section>

          {/* Community Skins */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[length:--font-size-xs] font-semibold uppercase tracking-wider text-aim-text-muted">
                Community Skins
              </h3>
              <button
                className="flex items-center gap-1.5 text-[length:--font-size-xs] bg-aim-accent hover:bg-aim-accent-hover text-aim-text-inverse px-3 py-1.5 rounded-[--radius-sm] font-medium transition-colors disabled:opacity-60"
                onClick={handleImportClick}
                disabled={importing}
              >
                <Upload size={13} />
                {importing ? 'Importing…' : 'Import .dxskin'}
              </button>
            </div>

            {importError && (
              <div className="mb-3 p-2.5 bg-aim-red-subtle border border-aim-red text-aim-red rounded-[--radius-sm] text-[length:--font-size-xs]">
                {importError}
              </div>
            )}

            {communitySkins.length === 0 ? (
              <div className="border-2 border-dashed border-aim-border rounded-[--radius-md] p-8 text-center">
                <Upload size={28} className="mx-auto mb-3 text-aim-text-muted opacity-40" />
                <p className="text-[length:--font-size-sm] text-aim-text-muted mb-1">No community skins installed</p>
                <p className="text-[length:--font-size-xs] text-aim-text-muted opacity-60">
                  Import a <code className="bg-aim-bg-surface px-1 py-0.5 rounded">.dxskin</code> file to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {communitySkins.map((skin) => (
                  <SkinCard
                    key={skin.id}
                    skin={skin}
                    isActive={activeSkinId === skin.id}
                    isPreviewing={previewSkinId === skin.id}
                    onPreviewEnter={() => handlePreviewEnter(skin)}
                    onApply={() => handleApply(skin.id)}
                    onExport={() => handleExport(skin)}
                    onDelete={() => removeSkin(skin.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Format Guide */}
          <section className="border-t border-aim-border-subtle pt-4">
            <h3 className="text-[length:--font-size-xs] font-semibold uppercase tracking-wider text-aim-text-muted mb-2">
              Create Your Own Skin
            </h3>
            <p className="text-[length:--font-size-xs] text-aim-text-muted leading-relaxed">
              A <code className="bg-aim-bg-surface px-1 py-0.5 rounded text-aim-accent">.dxskin</code> file is
              a ZIP archive containing a <code className="bg-aim-bg-surface px-1 py-0.5 rounded text-aim-accent">skin.json</code> file.
              Export any built-in theme to use as a starting point, then modify the color tokens.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-aim-border flex justify-between items-center flex-shrink-0">
          <span className="text-[length:--font-size-xs] text-aim-text-muted">
            {skins.length} skin{skins.length !== 1 ? 's' : ''} available
          </span>
          <button
            className="bg-aim-bg-surface hover:bg-aim-bg-elevated text-aim-text-primary px-4 py-2 rounded-[--radius-md] text-[length:--font-size-sm] font-medium transition-colors border border-aim-border"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".dxskin"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

/* ── Skin Card ──────────────────────────────────────────────────── */

interface SkinCardProps {
  skin: DXSkin;
  isActive: boolean;
  isPreviewing: boolean;
  onPreviewEnter: () => void;
  onApply: () => void;
  onExport: () => void;
  onDelete?: () => void;
}

const SkinCard: React.FC<SkinCardProps> = ({
  skin,
  isActive,
  isPreviewing,
  onPreviewEnter,
  onApply,
  onExport,
  onDelete,
}) => {
  return (
    <div
      className={`relative rounded-[--radius-md] border overflow-hidden cursor-pointer transition-all group ${
        isActive
          ? 'border-aim-accent shadow-[0_0_0_2px_var(--color-aim-accent)]'
          : isPreviewing
          ? 'border-aim-accent/60'
          : 'border-aim-border hover:border-aim-border-focus'
      }`}
      onMouseEnter={onPreviewEnter}
      onClick={onApply}
    >
      {/* Color swatch preview */}
      <SkinSwatch skin={skin} />

      {/* Info */}
      <div className="p-2.5 bg-aim-bg-surface">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <div className="font-semibold text-[length:--font-size-xs] text-aim-text-primary truncate">
              {skin.name}
            </div>
            <div className="text-[length:--font-size-xs] text-aim-text-muted truncate">
              {skin.colorScheme === 'light' ? '☀ Light' : '🌙 Dark'} · {skin.author}
            </div>
          </div>
          {isActive && (
            <span className="flex-shrink-0 bg-aim-accent text-aim-text-inverse rounded-full p-0.5">
              <Check size={11} />
            </span>
          )}
        </div>

        {/* Actions row */}
        <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isActive ? (
            <span className="flex-1 text-center text-[length:--font-size-xs] text-aim-accent font-medium py-1">
              Active
            </span>
          ) : (
            <button
              className="flex-1 text-[length:--font-size-xs] bg-aim-accent hover:bg-aim-accent-hover text-aim-text-inverse rounded-[--radius-sm] py-1 font-medium transition-colors"
              onClick={(e) => { e.stopPropagation(); onApply(); }}
            >
              Apply
            </button>
          )}
          <button
            className="p-1 hover:bg-aim-bg-elevated rounded-[--radius-sm] text-aim-text-muted hover:text-aim-text-primary transition-colors"
            title="Export .dxskin"
            onClick={(e) => { e.stopPropagation(); onExport(); }}
          >
            <Download size={13} />
          </button>
          {onDelete && (
            <button
              className="p-1 hover:bg-aim-red-subtle rounded-[--radius-sm] text-aim-text-muted hover:text-aim-red transition-colors"
              title="Remove skin"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Skin Swatch — mini color palette preview ───────────────────── */

const SkinSwatch: React.FC<{ skin: DXSkin }> = ({ skin }) => {
  const t = skin.tokens;
  return (
    <div
      className="h-16 w-full relative overflow-hidden"
      style={{ backgroundColor: t['bg-primary'] }}
    >
      {/* Simulated sidebar strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-10"
        style={{ backgroundColor: t['bg-secondary'], borderRight: `1px solid ${t['border']}` }}
      >
        {/* Avatar dots */}
        {[12, 28, 44].map((y) => (
          <div
            key={y}
            className="absolute left-2 w-5 h-5 rounded-full"
            style={{ top: y, backgroundColor: t['bg-surface'], border: `1px solid ${t['border']}` }}
          />
        ))}
        {/* Online dot */}
        <div
          className="absolute w-2 h-2 rounded-full"
          style={{ bottom: 8, right: 4, backgroundColor: t['online'] }}
        />
      </div>

      {/* Simulated chat area */}
      <div className="absolute left-12 right-2 top-2 bottom-2 flex flex-col gap-1.5">
        {/* Bubble - agent */}
        <div
          className="self-start rounded px-2 py-1 text-[9px] leading-none"
          style={{ backgroundColor: t['bubble-agent'], color: t['text-primary'], border: `1px solid ${t['border-subtle']}` }}
        >
          Hello!
        </div>
        {/* Bubble - user */}
        <div
          className="self-end rounded px-2 py-1 text-[9px] leading-none"
          style={{ backgroundColor: t['bubble-user'], color: t['text-primary'] }}
        >
          Hey
        </div>
        {/* Input bar */}
        <div
          className="mt-auto rounded px-2 py-1"
          style={{ backgroundColor: t['bg-input'], border: `1px solid ${t['border']}` }}
        />
      </div>

      {/* Accent splash in top-right */}
      <div
        className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full opacity-80"
        style={{ backgroundColor: t['accent'] }}
      />
    </div>
  );
};
