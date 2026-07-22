'use client';

import { TECH_BADGES, buildBadgeUrl } from '@/lib/tech-badges';

export default function BadgePicker({ selectedBadges = [], onChangeSelectedBadges, badgeStyle = 'for-the-badge', onChangeStyle }) {
  const toggleBadge = (id) => {
    if (selectedBadges.includes(id)) {
      onChangeSelectedBadges(selectedBadges.filter(bId => bId !== id));
    } else {
      onChangeSelectedBadges([...selectedBadges, id]);
    }
  };

  const categories = ['Languages', 'Frameworks', 'Tools'];

  return (
    <div className="flex flex-col gap-3 text-xs">
      {/* Badge Style Selector */}
      <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-white/5">
        <label className="text-slate-400 font-medium">Badge Style:</label>
        <select
          value={badgeStyle}
          onChange={(e) => onChangeStyle(e.target.value)}
          className="bg-slate-950 border border-white/10 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="for-the-badge">For-the-badge (Large)</option>
          <option value="flat">Flat (Clean)</option>
          <option value="flat-square">Flat Square</option>
        </select>
      </div>

      {/* Badges Categorized Grid */}
      {categories.map(cat => {
        const badgesInCat = TECH_BADGES.filter(b => b.category === cat);
        return (
          <div key={cat} className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">{cat}</span>
            <div className="flex flex-wrap gap-1.5">
              {badgesInCat.map(badge => {
                const isSelected = selectedBadges.includes(badge.id);
                return (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => toggleBadge(badge.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                        : 'bg-slate-900/80 text-slate-400 border-white/10 hover:border-slate-500 hover:text-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{badge.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected Badges Preview */}
      {selectedBadges.length > 0 && (
        <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-white/10 flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-400 font-medium">Selected Badges Preview:</span>
          <div className="flex gap-1.5 flex-wrap">
            {selectedBadges.map(id => {
              const b = TECH_BADGES.find(item => item.id === id);
              if (!b) return null;
              return (
                <img
                  key={id}
                  src={buildBadgeUrl(b, badgeStyle)}
                  alt={b.name}
                  className="h-6 rounded shadow-sm"
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
