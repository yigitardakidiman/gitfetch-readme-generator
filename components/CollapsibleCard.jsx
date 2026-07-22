'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CollapsibleCard({ title, icon, defaultOpen = false, children, extraHeader }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4 transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between font-mono font-bold text-xs uppercase tracking-wider text-[#58a6ff] select-none hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          <span>{title}</span>
          {extraHeader}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#8b949e] transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
      </button>

      {isOpen && (
        <div className="mt-4 flex flex-col gap-4">
          {children}
        </div>
      )}
    </div>
  );
}
