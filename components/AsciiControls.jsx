'use client';

import { CHAR_SETS } from '@/lib/ascii-engine';
import { PRESET_ASCII_LIBRARY } from '@/lib/ascii-presets';

export default function AsciiControls({
  state,
  onChangeState,
  onImageLoaded,
  onSelectPresetAscii,
  avatarThumbnail
}) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => onImageLoaded(evt.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => onImageLoaded(evt.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Preset ASCII Avatars */}
      <div className="flex flex-col gap-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
        <label className="text-slate-400 font-medium flex items-center gap-1.5">
          <span>✨ Ready Preset Avatars:</span>
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(PRESET_ASCII_LIBRARY).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => onSelectPresetAscii && onSelectPresetAscii(item.lines)}
              className="bg-slate-800 hover:bg-indigo-600/80 hover:text-white text-slate-300 px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 transition-all border border-white/5"
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* File Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById('nextFileInput')?.click()}
        className="border-2 border-dashed border-white/20 hover:border-indigo-400/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-900/50"
      >
        <p className="text-slate-300 font-medium">📸 Drop image here or click to upload</p>
        <input
          type="file"
          id="nextFileInput"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* URL Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-slate-400 font-medium">Or Image URL:</label>
        <input
          type="text"
          placeholder="https://example.com/avatar.jpg"
          onChange={(e) => e.target.value.trim() && onImageLoaded(e.target.value.trim())}
          className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* ASCII Resolution Slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-slate-300 font-medium">
          <label>ASCII Resolution (Width):</label>
          <span className="bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded text-[11px]">{state.asciiWidth}</span>
        </div>
        <input
          type="range"
          min="20"
          max="140"
          value={state.asciiWidth}
          onChange={(e) => onChangeState({ asciiWidth: parseInt(e.target.value) })}
          className="w-full accent-indigo-500 cursor-pointer"
        />
        <div className="flex gap-1.5 mt-1 flex-wrap">
          <button
            type="button"
            onClick={() => onChangeState({ asciiWidth: 42 })}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1 px-2 rounded text-[10px]"
          >
            ⚡ README.md (42)
          </button>
          <button
            type="button"
            onClick={() => onChangeState({ asciiWidth: 45 })}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-2 rounded text-[10px]"
          >
            Standard (45)
          </button>
          <button
            type="button"
            onClick={() => onChangeState({ asciiWidth: 75 })}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-2 rounded text-[10px]"
          >
            HD (75)
          </button>
          <button
            type="button"
            onClick={() => onChangeState({ asciiWidth: 110 })}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-2 rounded text-[10px]"
          >
            Ultra-HD (110)
          </button>
        </div>
      </div>

      {/* Font Size Slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-slate-300 font-medium">
          <label>ASCII Font Size (px):</label>
          <span className="bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded text-[11px]">
            {state.customFontSize > 0 ? `${state.customFontSize}px` : 'Auto'}
          </span>
        </div>
        <input
          type="range"
          min="4"
          max="14"
          step="0.5"
          value={state.customFontSize}
          onChange={(e) => onChangeState({ customFontSize: parseFloat(e.target.value) })}
          className="w-full accent-indigo-500 cursor-pointer"
        />
        <button
          type="button"
          onClick={() => onChangeState({ customFontSize: 0 })}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-2 rounded text-[10px] w-full text-center"
        >
          ⚡ Reset to Auto (Otomatik)
        </button>
      </div>

      {/* Density Select */}
      <div className="flex flex-col gap-1.5">
        <label className="text-slate-400 font-medium">Character Set Density:</label>
        <select
          value={state.charSetKey}
          onChange={(e) => onChangeState({ charSetKey: e.target.value })}
          className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="detailed">Detailed ($@B%8&WM#*...)</option>
          <option value="standard">Standard (@%#*+=-:.)</option>
          <option value="blocks">Blocks (█▓▒░ )</option>
          <option value="retro">Retro (NM%g|i;:,. )</option>
        </select>
      </div>

      {/* Contrast Slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-slate-300 font-medium">
          <label>Contrast:</label>
          <span className="bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded text-[11px]">{state.contrast}</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.1"
          value={state.contrast}
          onChange={(e) => onChangeState({ contrast: parseFloat(e.target.value) })}
          className="w-full accent-indigo-500 cursor-pointer"
        />
      </div>

      {/* Magic Auto Enhance Toggle */}
      <div className="bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-lg flex flex-col gap-1">
        <label className="flex items-center justify-between cursor-pointer text-white font-semibold">
          <span>✨ Magic Auto-Enhance</span>
          <input
            type="checkbox"
            checked={state.autoEnhance}
            onChange={(e) => onChangeState({ autoEnhance: e.target.checked })}
            className="accent-indigo-500 w-4 h-4 cursor-pointer"
          />
        </label>
        <span className="text-[10px] text-slate-400">Smart contrast balance & histogram tuning</span>
      </div>

      {/* Edge Sharpening */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-slate-300 font-medium">
          <label>Edge Sharpening (Sobel):</label>
          <span className="bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded text-[11px]">{Math.round(state.edgeSharpen * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={state.edgeSharpen}
          onChange={(e) => onChangeState({ edgeSharpen: parseFloat(e.target.value) })}
          className="w-full accent-indigo-500 cursor-pointer"
        />
      </div>

      {/* Invert & Dither */}
      <div className="flex gap-4 items-center pt-1">
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={state.invert}
            onChange={(e) => onChangeState({ invert: e.target.checked })}
            className="accent-indigo-500 w-4 h-4 cursor-pointer"
          />
          <span>Invert Colors</span>
        </label>
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={state.dither}
            onChange={(e) => onChangeState({ dither: e.target.checked })}
            className="accent-indigo-500 w-4 h-4 cursor-pointer"
          />
          <span>Dithering Mode</span>
        </label>
      </div>
    </div>
  );
}
