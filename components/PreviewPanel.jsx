'use client';

import { useState, useEffect } from 'react';
import { COLOR_THEMES } from '@/lib/presets';
import { buildStatsLines, mergeSideBySide, buildMarkdownCodeBlock, buildHtmlPreBlock } from '@/lib/neofetch-builder';
import { generateSvgCard } from '@/lib/svg-exporter';
import { Copy, Download, Terminal, FileCode, Link, Check, Play } from 'lucide-react';

export default function PreviewPanel({ state, onShowToast }) {
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'markdown' | 'svg' | 'api'
  const [copied, setCopied] = useState('');
  const [isPlayingAnim, setIsPlayingAnim] = useState(false);
  const [animTimer, setAnimTimer] = useState(null);

  const handleReplayAnimation = () => {
    setActiveTab('svg');
    setIsPlayingAnim(true);
    if (onShowToast) onShowToast('▶ Playing animation effect!');
    
    if (animTimer) clearTimeout(animTimer);
    const timer = setTimeout(() => {
      setIsPlayingAnim(false);
    }, 3500);
    setAnimTimer(timer);
  };

  useEffect(() => {
    if (state.animTrigger) {
      handleReplayAnimation();
    }
  }, [state.animTrigger]);

  const theme = state.customThemeEnabled && state.customTheme ? state.customTheme : (COLOR_THEMES[state.themeKey] || COLOR_THEMES.dracula);
  const statsLines = buildStatsLines(state.headerTitle, state.headerSeparator, [{ name: "", fields: state.fields }]);
  const mergedLines = mergeSideBySide(state.asciiLines, statsLines);
  const mdCode = buildMarkdownCodeBlock(mergedLines);
  const fullMarkdownCode = mdCode;

  const htmlPreCode = buildHtmlPreBlock(mergedLines, state.customFontSize > 0 ? state.customFontSize : 10);
  
  // Live Studio SVG preview (static when editing, animated when button clicked)
  const svgCode = generateSvgCard(state.asciiLines, statsLines, {
    themeKey: state.themeKey,
    customTheme: state.customThemeEnabled ? state.customTheme : null,
    fontSize: state.customFontSize > 0 ? state.customFontSize : undefined,
    animateCursor: state.animateCursor,
    animateTypewriter: state.animateTypewriter,
    animateFade: state.animateFade,
    isStudioPreview: true,
    previewPlaying: isPlayingAnim
  });

  // Raw SVG code for export / copy
  const exportSvgCode = generateSvgCard(state.asciiLines, statsLines, {
    themeKey: state.themeKey,
    customTheme: state.customThemeEnabled ? state.customTheme : null,
    fontSize: state.customFontSize > 0 ? state.customFontSize : undefined,
    animateCursor: state.animateCursor,
    animateTypewriter: state.animateTypewriter,
    animateFade: state.animateFade
  });

  let encodedConfig = '';
  try {
    const configObj = {
      asciiLines: state.asciiLines,
      fields: state.fields,
      headerTitle: state.headerTitle,
      customTheme: state.customThemeEnabled ? state.customTheme : null
    };
    const str = JSON.stringify(configObj);
    if (typeof window !== 'undefined') {
      const utf8Bytes = new TextEncoder().encode(str);
      let binary = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      encodedConfig = btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
  } catch (e) {
    console.warn("Base64 encode error:", e);
  }

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://gitfetch-readme-generator.vercel.app';

  const asciiParams = new URLSearchParams();
  asciiParams.set('user', state.headerTitle.split('@')[0] || 'user');
  asciiParams.set('theme', state.themeKey);
  if (state.animateCursor) asciiParams.set('cursor', 'true');
  if (state.animateTypewriter) asciiParams.set('typewriter', 'true');
  if (state.animateFade) asciiParams.set('fade', 'true');
  if (state.asciiWidth) asciiParams.set('asciiWidth', state.asciiWidth);
  if (state.edgeSharpen !== undefined) asciiParams.set('edgeSharpen', state.edgeSharpen);
  if (state.contrast !== undefined && state.contrast !== 1.2) asciiParams.set('contrast', state.contrast);
  if (state.charSetKey && state.charSetKey !== 'detailed') asciiParams.set('charSetKey', state.charSetKey);
  if (state.invert) asciiParams.set('invert', 'true');
  if (state.dither) asciiParams.set('dither', 'true');
  if (state.bgThreshold > 0) asciiParams.set('bgThreshold', state.bgThreshold);
  if (state.customFontSize > 0) asciiParams.set('fontSize', state.customFontSize);

  let textOnlyConfig = '';
  try {
    const textObj = {
      fields: state.fields,
      headerTitle: state.headerTitle,
      headerSeparator: state.headerSeparator,
      customTheme: state.customThemeEnabled ? state.customTheme : null
    };
    const str = JSON.stringify(textObj);
    if (typeof window !== 'undefined') {
      const utf8Bytes = new TextEncoder().encode(str);
      let binary = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      textOnlyConfig = btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
  } catch (e) {
    console.warn("Text config encode error:", e);
  }

  const shortApiUrl = `${baseUrl}/api/svg?${asciiParams.toString()}${textOnlyConfig ? `&config=${encodeURIComponent(textOnlyConfig)}` : ''}`;
  const liveApiUrl = `${baseUrl}/api/svg?${asciiParams.toString()}${encodedConfig ? `&config=${encodeURIComponent(encodedConfig)}` : ''}`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    if (onShowToast) onShowToast(`${type} copied to clipboard!`);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([exportSvgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `readme_neofetch_${state.themeKey}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast('SVG card downloaded!');
  };

  // Measure visible ASCII width
  const asciiColWidth = state.asciiLines.reduce((max, l) => Math.max(max, (l || '').trimEnd().length), 0);
  let asciiFontSize = state.customFontSize > 0 ? state.customFontSize : 13;
  if (state.customFontSize <= 0) {
    if (asciiColWidth > 100) asciiFontSize = 5.8;
    else if (asciiColWidth > 75) asciiFontSize = 7.5;
    else if (asciiColWidth > 55) asciiFontSize = 9.5;
  }

  return (
    <div className="flex flex-col bg-[#111827]/80 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden shadow-2xl min-w-0 w-full">
      {/* Tab Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/60 flex-wrap gap-2 min-w-0 w-full">
        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'terminal' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Terminal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('svg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'svg' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> SVG Card
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'api' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link className="w-3.5 h-3.5" /> Live API URL
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReplayAnimation}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md transition-all border border-indigo-400/30"
          >
            <Play className="w-3.5 h-3.5 fill-current text-white" /> Replay Animations
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Download SVG
          </button>
        </div>
      </div>

      {/* Preview Content Area */}
      <div className="p-6 overflow-hidden min-h-[420px] flex flex-col justify-center min-w-0 w-full" style={{ backgroundColor: theme.cardBg }}>
        {activeTab === 'terminal' && (
          <div className="flex gap-[0.6rem] items-start transition-all overflow-x-auto" style={{ color: theme.text }}>
            {/* ASCII Column */}
            <div
              className="font-mono whitespace-pre shrink-0"
              style={{ color: theme.ascii, fontSize: `${asciiFontSize}px`, lineHeight: 1.2 }}
            >
              {state.asciiLines.map((line, i) => (
                <div key={i}>{(line || '').trimEnd()}</div>
              ))}
            </div>

            {/* Stats Column */}
            <div className="flex-1 font-mono text-[13px] leading-[1.25] whitespace-pre">
              {statsLines.map((line, i) => {
                if (/^- .+ -{5,}/.test(line)) {
                  const match = line.match(/^- (.+?) (-{5,})/);
                  const sectionName = match ? match[1].trim() : line;
                  const dashes = match ? match[2] : '';
                  return (
                    <div key={i} className="font-bold text-[13px]" style={{ color: theme.title }}>
                      <span style={{ color: theme.separator }}>- </span>
                      {sectionName}{' '}
                      <span style={{ color: theme.separator }}>{'-'.repeat(Math.max(5, 42 - sectionName.length))}</span>
                    </div>
                  );
                }
                if (i === 0 && !line.includes(':')) {
                  return <div key={i} className="font-bold text-[14px]" style={{ color: theme.title }}>{line}</div>;
                }
                if (/^-{3,}$/.test(line.trim()) || /^={3,}$/.test(line.trim())) {
                  return <div key={i} style={{ color: theme.separator }}>{line}</div>;
                }
                if (line.includes(':') && line.includes('..')) {
                  const colonIdx = line.indexOf(':');
                  const keyPart = line.substring(0, colonIdx + 1);
                  const rest = line.substring(colonIdx + 1);
                  const dotsMatch = rest.match(/^(\s*)(\.{2,})(\s+)(.*)/);

                  if (dotsMatch) {
                    const [, preSpace, dots, postSpace, value] = dotsMatch;
                    return (
                      <div key={i}>
                        <span className="font-semibold" style={{ color: theme.key }}>{keyPart}</span>
                        <span style={{ color: theme.separator }}>{preSpace + dots}</span>
                        <span style={{ color: theme.value }}>{postSpace + value}</span>
                      </div>
                    );
                  }
                }
                if (line.includes(':')) {
                  const colonIdx = line.indexOf(':');
                  const keyPart = line.substring(0, colonIdx + 1);
                  const valPart = line.substring(colonIdx + 1);
                  return (
                    <div key={i}>
                      <span className="font-semibold" style={{ color: theme.key }}>{keyPart}</span>
                      <span style={{ color: theme.value }}>{valPart}</span>
                    </div>
                  );
                }
                return <div key={i} style={{ color: theme.text }}>{line || '\u00A0'}</div>;
              })}
            </div>
          </div>
        )}

        {activeTab === 'svg' && (
          <div className="flex flex-col gap-4 items-center w-full min-w-0">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReplayAnimation}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-md transition-all border border-indigo-400/30"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Replay Animations
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(exportSvgCode, 'SVG XML')}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 transition-all"
              >
                {copied === 'SVG XML' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy Raw SVG XML
              </button>
            </div>
            <div
              key={isPlayingAnim ? 'playing' : 'static'}
              className="w-full flex justify-center overflow-x-auto p-2"
              dangerouslySetInnerHTML={{ __html: svgCode }}
            />
          </div>
        )}

        {activeTab === 'api' && (
          <div className="flex flex-col gap-4 text-slate-200 min-w-0 w-full">
            {/* Option 1: Clean Short Live Link */}
            <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl flex flex-col gap-2 min-w-0 w-full overflow-hidden">
              <h3 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                <span>1. Short & Clean Live API Link (Recommended)</span>
              </h3>
              <p className="text-xs text-slate-300">
                Automatically fetches your live GitHub avatar & profile info. Cleanest link for your README.md:
              </p>
              <div className="flex gap-3 items-center bg-slate-950 px-3 py-2.5 rounded-lg border border-white/10 min-w-0 w-full overflow-hidden">
                <span
                  title={`<img src="${shortApiUrl}" alt="GitFetch Terminal" />`}
                  className="flex-1 min-w-0 block truncate font-mono text-xs text-cyan-400 select-all whitespace-nowrap overflow-hidden"
                >
                  {`<img src="${shortApiUrl}" alt="GitFetch Terminal" />`}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`<img src="${shortApiUrl}" alt="GitFetch Terminal" />`, 'Short API Link')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  {copied === 'Short API Link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Option 2: Full State Custom Link */}
            <div className="bg-slate-900/60 border border-white/10 p-4 rounded-xl flex flex-col gap-2 min-w-0 w-full overflow-hidden">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <span>2. Custom Studio State Encoded API Link</span>
              </h3>
              <p className="text-xs text-slate-400">
                Encodes custom hand-edited ASCII art and custom fields directly inside the URL parameters:
              </p>
              <div className="flex gap-3 items-center bg-slate-950 px-3 py-2.5 rounded-lg border border-white/10 min-w-0 w-full overflow-hidden">
                <span
                  title={`<img src="${liveApiUrl}" alt="GitFetch Terminal" />`}
                  className="flex-1 min-w-0 block truncate font-mono text-xs text-slate-400 select-all whitespace-nowrap overflow-hidden"
                >
                  {`<img src="${liveApiUrl}" alt="GitFetch Terminal" />`}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`<img src="${liveApiUrl}" alt="GitFetch Terminal" />`, 'Full API Link')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-md transition-all cursor-pointer border border-indigo-400/20"
                >
                  {copied === 'Full API Link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
