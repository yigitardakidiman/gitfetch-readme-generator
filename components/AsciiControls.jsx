'use client';

import { useState } from 'react';
import { getDefaultAsciiAvatar } from '@/lib/ascii-engine';
import { PRESET_ASCII_LIBRARY } from '@/lib/ascii-presets';
import {
  RotateCcw,
  Upload,
  Link2,
  Sliders,
  Sparkles,
  Grid,
  Terminal,
  Cpu,
  Code2,
  Coffee
} from 'lucide-react';

const PRESET_ICONS = {
  octocat: Terminal,
  tux: Cpu,
  skull: Sparkles,
  neovim: Code2,
  coffee: Coffee
};

export default function AsciiControls({
  state,
  onChangeState,
  onImageLoaded,
  onSelectPresetAscii,
  onRestoreGitHubAvatar,
  hasCustomImage
}) {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activePresetKey, setActivePresetKey] = useState('default');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setActivePresetKey('custom');
        onImageLoaded(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setActivePresetKey('custom');
        onImageLoaded(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    setActivePresetKey('custom');
    onImageLoaded(urlInput.trim());
  };

  const handleSelectBuiltInAscii = (key, lines) => {
    setActivePresetKey(key);
    if (onSelectPresetAscii) {
      onSelectPresetAscii(lines);
    }
  };

  const handleResetImageParams = () => {
    onChangeState({
      asciiWidth: 55,
      customFontSize: 0,
      charSetKey: 'detailed',
      contrast: 1.2,
      edgeSharpen: 0.4,
      autoEnhance: true,
      invert: false,
      dither: false
    });
  };

  const widthPresets = [
    { label: 'README (42)', value: 42 },
    { label: 'Compact (55)', value: 55 },
    { label: 'HD (75)', value: 75 },
    { label: 'Ultra (110)', value: 110 }
  ];

  const charSetOptions = [
    { key: 'detailed', label: 'Detailed', sample: '$@B%8&WM#*' },
    { key: 'standard', label: 'Standard', sample: '@%#*+=-:.' },
    { key: 'blocks', label: 'Blocks', sample: '█▓▒░ ' },
    { key: 'retro', label: 'Retro CLI', sample: 'NM%g|i;:.' }
  ];

  return (
    <div className="flex flex-col gap-5 text-xs font-mono">
      {/* SECTION 1: Image Source */}
      <div className="flex flex-col gap-3 bg-[#161b22] border border-[#30363d] rounded-lg p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9d1d9] flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-[#58a6ff]" />
            Image to ASCII Source
          </span>
          {onRestoreGitHubAvatar && (
            <button
              type="button"
              onClick={() => {
                setActivePresetKey('github');
                onRestoreGitHubAvatar();
              }}
              className="flex items-center gap-1 text-[11px] text-[#58a6ff] hover:text-[#79c0ff] bg-[#58a6ff]/10 hover:bg-[#58a6ff]/20 border border-[#58a6ff]/30 px-2 py-0.5 rounded transition-colors"
              title="Re-fetch avatar from GitHub username"
            >
              <RotateCcw className="w-3 h-3" />
              <span>GitHub Avatar</span>
            </button>
          )}
        </div>

        {/* File Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('studioAsciiFileInput')?.click()}
          className={`border border-dashed rounded-md p-3.5 text-center cursor-pointer transition-all flex flex-col items-center gap-1.5 ${
            isDragging
              ? 'border-[#58a6ff] bg-[#58a6ff]/10 text-white'
              : 'border-[#30363d] hover:border-[#8b949e] bg-[#0d1117] text-[#8b949e] hover:text-[#c9d1d9]'
          }`}
        >
          <Upload className="w-4 h-4 text-[#58a6ff]" />
          <p className="text-xs font-medium text-[#c9d1d9]">
            Drop an image here or <span className="text-[#58a6ff] underline">browse</span>
          </p>
          <span className="text-[10px] text-[#8b949e]">PNG, JPG, WebP — Auto-converted via Sobel Engine</span>
          <input
            type="file"
            id="studioAsciiFileInput"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Controlled Image URL Input */}
        <div className="flex gap-1.5">
          <div className="relative flex-1 flex items-center">
            <Link2 className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              placeholder="Paste direct image URL..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-8 pr-2.5 py-1.5 text-xs text-[#c9d1d9] placeholder-[#8b949e]/60 focus:outline-none focus:border-[#58a6ff]"
            />
          </div>
          <button
            type="button"
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            className="bg-[#21262d] hover:bg-[#30363d] disabled:opacity-40 disabled:cursor-not-allowed text-[#c9d1d9] hover:text-white px-3 py-1.5 rounded-md border border-[#30363d] text-xs font-medium transition-colors shrink-0"
          >
            Load
          </button>
        </div>
      </div>

      {/* SECTION 2: Built-In ASCII Art Presets */}
      <div className="flex flex-col gap-2.5 bg-[#161b22] border border-[#30363d] rounded-lg p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9d1d9] flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-[#3fb950]" />
            Built-in ASCII Art Presets
          </span>
          <span className="text-[10px] text-[#8b949e]">Instant vector art</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => handleSelectBuiltInAscii('default', getDefaultAsciiAvatar())}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-md border text-left transition-all ${
              activePresetKey === 'default' && !hasCustomImage
                ? 'bg-[#58a6ff]/15 border-[#58a6ff] text-white'
                : 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9] hover:border-[#8b949e]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#58a6ff] shrink-0" />
            <span className="truncate text-[11px] font-medium">Default Portrait</span>
          </button>

          {Object.entries(PRESET_ASCII_LIBRARY).map(([key, item]) => {
            const IconComponent = PRESET_ICONS[key] || Terminal;
            const isSelected = activePresetKey === key && !hasCustomImage;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectBuiltInAscii(key, item.lines)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-md border text-left transition-all ${
                  isSelected
                    ? 'bg-[#58a6ff]/15 border-[#58a6ff] text-white'
                    : 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9] hover:border-[#8b949e]'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5 text-[#3fb950] shrink-0" />
                <span className="truncate text-[11px] font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Resolution & Character Density */}
      <div className="flex flex-col gap-4 bg-[#161b22] border border-[#30363d] rounded-lg p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9d1d9] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#58a6ff]" />
            Geometry & Sobel Engine
          </span>
          <button
            type="button"
            onClick={handleResetImageParams}
            className="text-[11px] text-[#8b949e] hover:text-[#c9d1d9] underline underline-offset-2"
          >
            Reset defaults
          </button>
        </div>

        {/* ASCII Width Slider + Quick Pills */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[#c9d1d9] font-medium">Columns (Width)</label>
            <span className="bg-[#0d1117] border border-[#30363d] text-[#58a6ff] font-mono px-2 py-0.5 rounded text-[11px] tabular-nums">
              {state.asciiWidth} chars
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="140"
            value={state.asciiWidth}
            onChange={(e) => onChangeState({ asciiWidth: parseInt(e.target.value, 10) })}
            className="w-full accent-[#58a6ff] cursor-pointer h-1.5 bg-[#0d1117] rounded-lg"
          />
          <div className="grid grid-cols-4 gap-1.5">
            {widthPresets.map((preset) => {
              const active = state.asciiWidth === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => onChangeState({ asciiWidth: preset.value })}
                  className={`py-1 px-1.5 rounded text-[10px] font-medium border transition-colors ${
                    active
                      ? 'bg-[#58a6ff]/15 border-[#58a6ff] text-[#58a6ff] font-bold'
                      : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Size Override */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#30363d]/60">
          <div className="flex justify-between items-center">
            <label className="text-[#c9d1d9] font-medium">Font Size Override</label>
            <div className="flex items-center gap-1.5">
              {state.customFontSize > 0 && (
                <button
                  type="button"
                  onClick={() => onChangeState({ customFontSize: 0 })}
                  className="text-[10px] text-[#8b949e] hover:text-white bg-[#21262d] px-1.5 py-0.5 rounded border border-[#30363d]"
                >
                  Set Auto
                </button>
              )}
              <span className="bg-[#0d1117] border border-[#30363d] text-[#58a6ff] font-mono px-2 py-0.5 rounded text-[11px] tabular-nums">
                {state.customFontSize > 0 ? `${state.customFontSize}px` : 'Auto-fit'}
              </span>
            </div>
          </div>
          <input
            type="range"
            min="4"
            max="14"
            step="0.5"
            value={state.customFontSize || 10}
            onChange={(e) => onChangeState({ customFontSize: parseFloat(e.target.value) })}
            className="w-full accent-[#58a6ff] cursor-pointer h-1.5 bg-[#0d1117] rounded-lg"
          />
        </div>

        {/* Character Set Grid */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#30363d]/60">
          <label className="text-[#c9d1d9] font-medium">Character Palette</label>
          <div className="grid grid-cols-2 gap-1.5">
            {charSetOptions.map((opt) => {
              const active = state.charSetKey === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onChangeState({ charSetKey: opt.key })}
                  className={`flex flex-col items-start p-2 rounded-md border text-left transition-all ${
                    active
                      ? 'bg-[#58a6ff]/15 border-[#58a6ff] text-white'
                      : 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9] hover:border-[#8b949e]'
                  }`}
                >
                  <span className="text-[11px] font-semibold">{opt.label}</span>
                  <span className="text-[10px] text-[#8b949e] tracking-widest mt-0.5 font-mono truncate w-full">
                    {opt.sample}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contrast & Edge Sharpening Sliders */}
        <div className="grid grid-cols-1 gap-3 pt-2 border-t border-[#30363d]/60">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[#c9d1d9] font-medium">Contrast Ratio</label>
              <span className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] px-2 py-0.5 rounded text-[11px] tabular-nums">
                {state.contrast.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={state.contrast}
              onChange={(e) => onChangeState({ contrast: parseFloat(e.target.value) })}
              className="w-full accent-[#58a6ff] cursor-pointer h-1.5 bg-[#0d1117] rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[#c9d1d9] font-medium">Sobel Edge Detection</label>
              <span className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] px-2 py-0.5 rounded text-[11px] tabular-nums">
                {Math.round(state.edgeSharpen * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={state.edgeSharpen}
              onChange={(e) => onChangeState({ edgeSharpen: parseFloat(e.target.value) })}
              className="w-full accent-[#58a6ff] cursor-pointer h-1.5 bg-[#0d1117] rounded-lg"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#30363d]/60">
          <label className="flex items-center justify-between p-2 rounded-md bg-[#0d1117] border border-[#30363d] cursor-pointer hover:border-[#8b949e] transition-colors">
            <div className="flex flex-col">
              <span className="text-[#c9d1d9] font-semibold text-[11px]">Auto Histogram Balance</span>
              <span className="text-[10px] text-[#8b949e]">Normalizes shadows & highlights</span>
            </div>
            <input
              type="checkbox"
              checked={state.autoEnhance}
              onChange={(e) => onChangeState({ autoEnhance: e.target.checked })}
              className="accent-[#238636] w-4 h-4 cursor-pointer rounded"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center justify-between p-2 rounded-md bg-[#0d1117] border border-[#30363d] cursor-pointer hover:border-[#8b949e] transition-colors">
              <span className="text-[#c9d1d9] font-medium text-[11px]">Invert Luma</span>
              <input
                type="checkbox"
                checked={state.invert}
                onChange={(e) => onChangeState({ invert: e.target.checked })}
                className="accent-[#238636] w-4 h-4 cursor-pointer rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-md bg-[#0d1117] border border-[#30363d] cursor-pointer hover:border-[#8b949e] transition-colors">
              <span className="text-[#c9d1d9] font-medium text-[11px]">Dithering</span>
              <input
                type="checkbox"
                checked={state.dither}
                onChange={(e) => onChangeState({ dither: e.target.checked })}
                className="accent-[#238636] w-4 h-4 cursor-pointer rounded"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

