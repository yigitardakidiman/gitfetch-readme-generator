'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Upload, Copy } from 'lucide-react';

export default function Header({ onQuickCopy, onExportJson, onImportJson }) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[#30363d] bg-[#161b22]/90 backdrop-blur-md sticky top-0 z-50 font-mono">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Home
        </Link>
        <div className="flex items-center gap-3 border-l border-white/10 pl-4">
          <div className="bg-[#21262d] border border-[#30363d] text-[#58a6ff] px-2.5 py-1 rounded text-xs font-bold font-mono">
            $ gitfetch
          </div>
          <div>
            <h1 className="font-bold text-sm text-white">
              GitFetch Studio
            </h1>
            <p className="text-[11px] text-[#8b949e]">Terminal Profile Cards for GitHub READMEs</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onExportJson}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" /> Export JSON
        </button>
        <label className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 transition-all cursor-pointer">
          <Upload className="w-3.5 h-3.5 text-cyan-400" /> Load JSON
          <input
            type="file"
            accept=".json"
            onChange={onImportJson}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={onQuickCopy}
          className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold px-4 py-1.5 rounded-lg border border-[#3fb950]/30 shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Markdown</span>
        </button>
      </div>
    </header>
  );
}
