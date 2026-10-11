'use client';

export default function CustomThemePicker({ theme, onChangeTheme }) {
  const handleColorChange = (key, hex) => {
    onChangeTheme({
      ...theme,
      [key]: hex
    });
  };

  const fields = [
    { key: 'cardBg', label: 'Background' },
    { key: 'title', label: 'Header / Title' },
    { key: 'key', label: 'Field Keys' },
    { key: 'value', label: 'Field Values' },
    { key: 'ascii', label: 'ASCII Art' },
    { key: 'separator', label: 'Separators' }
  ];

  return (
    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
      {fields.map((f) => {
        const currentHex = theme[f.key] || '#ffffff';
        return (
          <label
            key={f.key}
            className="flex items-center justify-between bg-[#0d1117] hover:border-[#8b949e] p-2 rounded-md border border-[#30363d] cursor-pointer transition-colors"
          >
            <div className="flex flex-col min-w-0">
              <span className="text-[#c9d1d9] font-medium text-[11px] truncate">{f.label}</span>
              <span className="text-[10px] text-[#8b949e] uppercase tabular-nums">{currentHex}</span>
            </div>
            <div className="relative flex items-center shrink-0">
              <input
                type="color"
                value={currentHex}
                onChange={(e) => handleColorChange(f.key, e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border border-[#30363d] bg-transparent p-0"
              />
            </div>
          </label>
        );
      })}
    </div>
  );
}

