'use client';

export default function Header({ onQuickCopy }) {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-[#30363d] bg-[#161b22]/90 backdrop-blur-md sticky top-0 z-50 font-mono">
      <div className="flex items-center gap-3">
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

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onQuickCopy}
          className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold px-4 py-2 rounded border border-[#3fb950]/30 shadow-md flex items-center gap-1.5 transition-all"
        >
          <span>📋</span> Kopyala (Markdown)
        </button>
      </div>
    </header>
  );
}
