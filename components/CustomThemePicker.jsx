'use client';

export default function CustomThemePicker({ theme, onChangeTheme }) {
  const handleColorChange = (key, hex) => {
    onChangeTheme({
      ...theme,
      [key]: hex
    });
  };

  const fields = [
    { key: 'cardBg', label: 'Card Background' },
    { key: 'title', label: 'Title & Headers' },
    { key: 'key', label: 'Stats Keys' },
    { key: 'value', label: 'Stats Values' },
    { key: 'ascii', label: 'ASCII Art Color' },
    { key: 'separator', label: 'Separators & Dots' }
  ];

  return (
    <div className="flex flex-col gap-2.5 text-xs">
      <div className="grid grid-cols-2 gap-2">
        {fields.map(f => (
          <div key={f.key} className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <span className="text-slate-300 font-medium text-[11px]">{f.label}</span>
            <input
              type="color"
              value={theme[f.key] || '#ffffff'}
              onChange={(e) => handleColorChange(f.key, e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
