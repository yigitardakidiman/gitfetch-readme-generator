'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Upload, Copy, Check, Sparkles, Terminal } from 'lucide-react';
import { useState } from 'react';
import { PRESETS } from '@/lib/presets';

export default function Header({
  onQuickCopy,
  onExportJson,
  onImportJson,
  onSelectPreset,
  currentTitle
}) {
  const [copiedMd, setCopiedMd] = useState(false);

  const handleCopyClick = () => {
    if (onQuickCopy) onQuickCopy();
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-[#30363d] bg-[#161b22] z-40 font-mono select-none">
      {/* Left: Brand & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] hover:text-white px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
          title="Back to Landing Page"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#8b949e]" />
          <span className="hidden sm:inline">Exit</span>
        </Link>

        <div className="h-4 w-[1px] bg-[#30363d]" />

        <div className="flex items-center gap-2.5">
          <div className="bg-[#0d1117] border border-[#30363d] text-[#58a6ff] px-2 py-1 rounded text-xs font-bold flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#3fb950]" />
            <span>gitfetch</span>
          </div>
          <span className="text-[#8b949e] text-xs hidden md:inline">/</span>
          <span className="text-xs font-semibold text-[#c9d1d9] hidden md:inline">studio</span>
          {currentTitle && (
            <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[11px] text-[#8b949e]">
              {currentTitle}
            </span>
          )}
        </div>
      </div>

      {/* Center: Quick Template Loader */}
      {onSelectPreset && (
        <div className="hidden lg:flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] p-1 rounded-md">
          <span className="text-[11px] text-[#8b949e] px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#58a6ff]" />
            Templates:
          </span>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => onSelectPreset(key)}
              className="px-2.5 py-1 rounded text-[11px] text-[#c9d1d9] hover:text-white hover:bg-[#21262d] transition-colors"
            >
              {key === 'neofetch' ? 'Standard' : key === 'cyberpunk' ? 'Cyberpunk' : 'Minimal'}
            </button>
          ))}
        </div>
      )}

      {/* Right: Config Import/Export & Primary Copy CTA */}
      <div className="flex items-center gap-2">
        <label
          className="flex items-center gap-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white text-xs font-medium px-2.5 py-1.5 rounded-md border border-[#30363d] transition-colors cursor-pointer"
          title="Import JSON Configuration"
        >
          <Upload className="w-3.5 h-3.5 text-[#58a6ff]" />
          <span className="hidden sm:inline">Import</span>
          <input
            type="file"
            accept=".json"
            onChange={onImportJson}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={onExportJson}
          className="flex items-center gap-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white text-xs font-medium px-2.5 py-1.5 rounded-md border border-[#30363d] transition-colors"
          title="Export JSON Configuration"
        >
          <Download className="w-3.5 h-3.5 text-[#8b949e]" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          type="button"
          onClick={handleCopyClick}
          className="bg-[#238636] hover:bg-[#2ea043] active:scale-[0.99] text-white text-xs font-bold px-3.5 py-1.5 rounded-md border border-[#3fb950]/40 shadow-sm flex items-center gap-1.5 transition-all"
        >
          {copiedMd ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Markdown</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}

