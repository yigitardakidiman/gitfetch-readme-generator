'use client';

import { useState, useEffect, useMemo } from 'react';
import { COLOR_THEMES } from '@/lib/presets';
import { buildStatsLines, mergeSideBySide, buildMarkdownCodeBlock, buildHtmlPreBlock } from '@/lib/neofetch-builder';
import { generateSvgCard } from '@/lib/svg-exporter';
import {
  Copy,
  Download,
  Terminal,
  FileCode,
  Link2,
  Check,
  Play,
  Code,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

function encodeBase64Url(obj) {
  try {
    if (typeof window === 'undefined') return '';
    const str = JSON.stringify(obj);
    const utf8Bytes = new TextEncoder().encode(str);
    const chunkSize = 0x8000;
    const chunks = [];
    for (let i = 0; i < utf8Bytes.length; i += chunkSize) {
      chunks.push(String.fromCharCode.apply(null, utf8Bytes.subarray(i, i + chunkSize)));
    }
    return btoa(chunks.join(''))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    console.warn('Base64 encode error:', e);
    return '';
  }
}

export default function PreviewPanel({ state, onShowToast }) {
  const [activeTab, setActiveTab] = useState('svg'); // 'svg' | 'terminal' | 'markdown' | 'api'
  const [copied, setCopied] = useState('');
  const [isPlayingAnim, setIsPlayingAnim] = useState(false);
  const [animRunId, setAnimRunId] = useState(0);
  const [canvasBgMode, setCanvasBgMode] = useState('dark'); // 'dark' | 'light'
  const [embedFormat, setEmbedFormat] = useState('html'); // 'html' | 'md'

  const handleReplayAnimation = () => {
    if (activeTab !== 'svg') {
      setActiveTab('svg');
    }
    setIsPlayingAnim(true);
    setAnimRunId((prev) => prev + 1);
    if (onShowToast) onShowToast('Replaying terminal CSS animations...');
  };

  useEffect(() => {
    if (state.animTrigger) {
      handleReplayAnimation();
    }
  }, [state.animTrigger]);

  // Turn off animation mode when the user actively edits content/sliders so live edits never stutter
  useEffect(() => {
    if (isPlayingAnim) {
      setIsPlayingAnim(false);
    }
  }, [
    state.headerTitle,
    state.headerSeparator,
    state.themeKey,
    state.customThemeEnabled,
    state.customTheme,
    state.customFontSize,
    state.fields,
    state.asciiLines
  ]);

  const theme = useMemo(() => {
    return state.customThemeEnabled && state.customTheme
      ? state.customTheme
      : COLOR_THEMES[state.themeKey] || COLOR_THEMES.dracula;
  }, [state.customThemeEnabled, state.customTheme, state.themeKey]);

  const statsLines = useMemo(() => {
    return buildStatsLines(state.headerTitle, state.headerSeparator, [
      { name: '', fields: state.fields }
    ]);
  }, [state.headerTitle, state.headerSeparator, state.fields]);

  const mergedLines = useMemo(() => {
    return mergeSideBySide(state.asciiLines, statsLines);
  }, [state.asciiLines, statsLines]);

  const mdCode = useMemo(() => buildMarkdownCodeBlock(mergedLines), [mergedLines]);

  const htmlPreCode = useMemo(
    () => buildHtmlPreBlock(mergedLines, state.customFontSize > 0 ? state.customFontSize : 10),
    [mergedLines, state.customFontSize]
  );

  // Live Studio SVG preview (memoized to prevent unnecessary DOM re-parses)
  const svgCode = useMemo(() => {
    return generateSvgCard(state.asciiLines, statsLines, {
      themeKey: state.themeKey,
      customTheme: state.customThemeEnabled ? state.customTheme : null,
      fontSize: state.customFontSize > 0 ? state.customFontSize : undefined,
      animateCursor: state.animateCursor,
      animateTypewriter: state.animateTypewriter,
      animateFade: state.animateFade,
      isStudioPreview: true,
      previewPlaying: isPlayingAnim
    });
  }, [
    state.asciiLines,
    statsLines,
    state.themeKey,
    state.customThemeEnabled,
    state.customTheme,
    state.customFontSize,
    state.animateCursor,
    state.animateTypewriter,
    state.animateFade,
    isPlayingAnim
  ]);

  // Raw SVG code for export / copy
  const exportSvgCode = useMemo(() => {
    return generateSvgCard(state.asciiLines, statsLines, {
      themeKey: state.themeKey,
      customTheme: state.customThemeEnabled ? state.customTheme : null,
      fontSize: state.customFontSize > 0 ? state.customFontSize : undefined,
      animateCursor: state.animateCursor,
      animateTypewriter: state.animateTypewriter,
      animateFade: state.animateFade
    });
  }, [
    state.asciiLines,
    statsLines,
    state.themeKey,
    state.customThemeEnabled,
    state.customTheme,
    state.customFontSize,
    state.animateCursor,
    state.animateTypewriter,
    state.animateFade
  ]);

  const { shortApiUrl, liveApiUrl } = useMemo(() => {
    const baseUrl =
      typeof window !== 'undefined'
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
    if (state.contrast !== undefined && state.contrast !== 1.2)
      asciiParams.set('contrast', state.contrast);
    if (state.charSetKey && state.charSetKey !== 'detailed')
      asciiParams.set('charSetKey', state.charSetKey);
    if (state.invert) asciiParams.set('invert', 'true');
    if (state.dither) asciiParams.set('dither', 'true');
    if (state.bgThreshold > 0) asciiParams.set('bgThreshold', state.bgThreshold);
    if (state.customFontSize > 0) asciiParams.set('fontSize', state.customFontSize);

    const textOnlyConfig = encodeBase64Url({
      fields: state.fields,
      headerTitle: state.headerTitle,
      headerSeparator: state.headerSeparator,
      customTheme: state.customThemeEnabled ? state.customTheme : null
    });

    const encodedConfig = encodeBase64Url({
      asciiLines: state.asciiLines,
      fields: state.fields,
      headerTitle: state.headerTitle,
      customTheme: state.customThemeEnabled ? state.customTheme : null
    });

    const queryStr = asciiParams.toString();
    return {
      shortApiUrl: `${baseUrl}/api/svg?${queryStr}${
        textOnlyConfig ? `&config=${encodeURIComponent(textOnlyConfig)}` : ''
      }`,
      liveApiUrl: `${baseUrl}/api/svg?${queryStr}${
        encodedConfig ? `&config=${encodeURIComponent(encodedConfig)}` : ''
      }`
    };
  }, [
    state.headerTitle,
    state.headerSeparator,
    state.themeKey,
    state.animateCursor,
    state.animateTypewriter,
    state.animateFade,
    state.asciiWidth,
    state.edgeSharpen,
    state.contrast,
    state.charSetKey,
    state.invert,
    state.dither,
    state.bgThreshold,
    state.customFontSize,
    state.fields,
    state.customThemeEnabled,
    state.customTheme,
    state.asciiLines
  ]);

  const quickEmbedSnippet =
    embedFormat === 'html'
      ? `<img src="${shortApiUrl}" alt="GitFetch Terminal" />`
      : `![GitFetch Terminal](${shortApiUrl})`;

  const fullEmbedSnippet =
    embedFormat === 'html'
      ? `<img src="${liveApiUrl}" alt="GitFetch Terminal" />`
      : `![GitFetch Terminal](${liveApiUrl})`;

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
    link.download = `gitfetch_${state.headerTitle.split('@')[0] || 'profile'}_${state.themeKey}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast('SVG card downloaded!');
  };

  // Measure visible ASCII width for DOM terminal preview
  const asciiColWidth = state.asciiLines.reduce(
    (max, l) => Math.max(max, (l || '').trimEnd().length),
    0
  );
  let asciiFontSize = state.customFontSize > 0 ? state.customFontSize : 13;
  if (state.customFontSize <= 0) {
    if (asciiColWidth > 100) asciiFontSize = 5.8;
    else if (asciiColWidth > 75) asciiFontSize = 7.5;
    else if (asciiColWidth > 55) asciiFontSize = 9.5;
  }

  const tabs = [
    { id: 'svg', label: 'SVG Card', icon: FileCode },
    { id: 'terminal', label: 'Interactive CLI', icon: Terminal },
    { id: 'markdown', label: 'Markdown Text', icon: Code },
    { id: 'api', label: 'Embed & API', icon: Link2 }
  ];

  return (
    <div className="flex flex-col flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden shadow-xl min-w-0 min-h-0 w-full h-full font-mono">
      {/* Top Stage Header Bar */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-[#30363d] bg-[#161b22] flex-wrap gap-2 min-w-0 w-full">
        {/* View Mode Tabs */}
        <div className="flex items-center bg-[#0d1117] p-1 rounded-md border border-[#30363d] overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#21262d] text-white font-bold border border-[#30363d] shadow-sm'
                    : 'text-[#8b949e] hover:text-[#c9d1d9]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#58a6ff]' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Stage Controls */}
        <div className="flex items-center gap-1.5">
          {/* README Backdrop Light/Dark Toggle */}
          {(activeTab === 'svg' || activeTab === 'terminal') && (
            <button
              type="button"
              onClick={() => setCanvasBgMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              className="flex items-center gap-1.5 bg-[#0d1117] hover:bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9] text-[11px] font-medium px-2.5 py-1 rounded-md border border-[#30363d] transition-colors"
              title="Toggle simulated GitHub README background (Dark / Light)"
            >
              {canvasBgMode === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#58a6ff]" />
                  <span className="hidden sm:inline">README Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#e3b341]" />
                  <span className="hidden sm:inline">README Light</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleReplayAnimation}
            className="flex items-center gap-1.5 bg-[#21262d] hover:bg-[#30363d] active:scale-[0.98] text-[#c9d1d9] hover:text-white text-[11px] font-medium px-2.5 py-1 rounded-md border border-[#30363d] transition-all"
            title="Replay Typewriter / Fade CSS Animations"
          >
            <Play className="w-3.5 h-3.5 text-[#3fb950] fill-current" />
            <span className="hidden sm:inline">Replay Anim</span>
          </button>

          <button
            type="button"
            onClick={() => copyToClipboard(exportSvgCode, 'Raw SVG XML')}
            className="flex items-center gap-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white text-[11px] font-medium px-2.5 py-1 rounded-md border border-[#30363d] transition-colors"
            title="Copy Raw SVG XML"
          >
            {copied === 'Raw SVG XML' ? (
              <Check className="w-3.5 h-3.5 text-[#3fb950]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#8b949e]" />
            )}
            <span className="hidden xl:inline">Copy SVG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            className="flex items-center gap-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white text-[11px] font-medium px-2.5 py-1 rounded-md border border-[#30363d] transition-colors"
            title="Download standalone .svg file"
          >
            <Download className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span className="hidden sm:inline">.SVG</span>
          </button>
        </div>
      </div>

      {/* Main Stage Content Area */}
      <div
        className={`flex-1 p-3 sm:p-4 lg:p-5 ${
          activeTab === 'svg' ? 'overflow-hidden justify-center' : 'overflow-auto'
        } flex flex-col items-center min-h-[320px] lg:min-h-0 min-w-0 w-full transition-colors duration-200 ${
          (activeTab === 'svg' || activeTab === 'terminal') && canvasBgMode === 'light'
            ? 'bg-[#f6f8fa]'
            : 'bg-[#090d13]'
        }`}
        style={{
          backgroundImage:
            (activeTab === 'svg' || activeTab === 'terminal') && canvasBgMode === 'light'
              ? 'radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px)'
              : 'radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* TAB 1: SVG CARD (PIXEL-PERFECT GITHUB README PREVIEW) */}
        {activeTab === 'svg' && (
          <div
            key={isPlayingAnim ? `anim-${animRunId}` : 'static'}
            className="w-full h-[360px] sm:h-[420px] lg:h-full min-h-0 flex items-center justify-center overflow-hidden drop-shadow-2xl"
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />
        )}

        {/* TAB 2: INTERACTIVE DOM TERMINAL */}
        {activeTab === 'terminal' && (
          <div
            className="w-full max-w-[920px] my-auto rounded-xl border border-[#30363d] overflow-hidden shadow-2xl transition-all"
            style={{ backgroundColor: theme.cardBg }}
          >
            {/* Terminal Window Header Bar */}
            <div
              className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between"
              style={{ backgroundColor: 'rgba(0,0,0,0.22)' }}
            >
              <div className="flex items-center gap-2">
                {(theme.dots || ['#ff5555', '#f1fa8c', '#50fa7b']).map((dot, idx) => (
                  <span
                    key={idx}
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: dot }}
                  />
                ))}
              </div>
              <span className="text-xs font-mono opacity-60" style={{ color: theme.text || '#c9d1d9' }}>
                {state.headerTitle} — neofetch
              </span>
              <div className="w-12" />
            </div>

            {/* Terminal Body */}
            <div
              className="p-6 flex gap-[0.8rem] items-start transition-all overflow-x-auto"
              style={{ color: theme.text }}
            >
              {/* ASCII Column */}
              <div
                className="font-mono whitespace-pre shrink-0 select-all"
                style={{ color: theme.ascii, fontSize: `${asciiFontSize}px`, lineHeight: 1.2 }}
              >
                {state.asciiLines.map((line, i) => (
                  <div key={i}>{(line || '').trimEnd()}</div>
                ))}
              </div>

              {/* Stats Column */}
              <div className="flex-1 font-mono text-[13px] leading-[1.28] whitespace-pre select-all">
                {statsLines.map((line, i) => {
                  if (/^- .+ -{5,}/.test(line)) {
                    const match = line.match(/^- (.+?) (-{5,})/);
                    const sectionName = match ? match[1].trim() : line;
                    return (
                      <div key={i} className="font-bold text-[13px]" style={{ color: theme.title }}>
                        <span style={{ color: theme.separator }}>- </span>
                        {sectionName}{' '}
                        <span style={{ color: theme.separator }}>
                          {'-'.repeat(Math.max(5, 42 - sectionName.length))}
                        </span>
                      </div>
                    );
                  }
                  if (i === 0 && !line.includes(':')) {
                    return (
                      <div key={i} className="font-bold text-[14px]" style={{ color: theme.title }}>
                        {line}
                      </div>
                    );
                  }
                  if (/^-{3,}$/.test(line.trim()) || /^={3,}$/.test(line.trim())) {
                    return (
                      <div key={i} style={{ color: theme.separator }}>
                        {line}
                      </div>
                    );
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
                          <span className="font-semibold" style={{ color: theme.key }}>
                            {keyPart}
                          </span>
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
                        <span className="font-semibold" style={{ color: theme.key }}>
                          {keyPart}
                        </span>
                        <span style={{ color: theme.value }}>{valPart}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={i} style={{ color: theme.text }}>
                      {line || '\u00A0'}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MARKDOWN / HTML CODE VIEWER */}
        {activeTab === 'markdown' && (
          <div className="w-full max-w-4xl my-auto flex flex-col gap-4">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1117] border-b border-[#30363d]">
                <span className="text-xs font-bold text-[#c9d1d9]">
                  Plain Markdown Code Block (```text)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(mdCode, 'Markdown Code Block')}
                  className="bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copied === 'Markdown Code Block' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy Markdown</span>
                </button>
              </div>
              <pre className="p-4 text-[11px] leading-[1.25] text-[#c9d1d9] overflow-x-auto max-h-[340px] bg-[#0d1117]">
                {mdCode}
              </pre>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1117] border-b border-[#30363d]">
                <span className="text-xs font-bold text-[#c9d1d9]">
                  HTML &lt;pre&gt; Block (Custom Font Sizing)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(htmlPreCode, 'HTML Pre Block')}
                  className="bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copied === 'HTML Pre Block' ? (
                    <Check className="w-3.5 h-3.5 text-[#3fb950]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy HTML</span>
                </button>
              </div>
              <pre className="p-4 text-[11px] leading-[1.25] text-[#8b949e] overflow-x-auto max-h-[200px] bg-[#0d1117]">
                {htmlPreCode}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: EMBED & API URLS */}
        {activeTab === 'api' && (
          <div className="w-full max-w-3xl my-auto flex flex-col gap-4 text-[#c9d1d9]">
            {/* Option 1: Clean Short Live Link */}
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="font-bold text-xs text-[#3fb950] flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1. Live GitHub Avatar API Endpoint (Recommended)</span>
                </h3>
                <span className="text-[10px] bg-[#238636]/20 text-[#3fb950] border border-[#3fb950]/30 px-2 py-0.5 rounded font-bold">
                  Auto-Fetches GitHub Avatar
                </span>
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Dynamically renders your GitHub profile picture and custom fields on the fly. Best for README.md:
              </p>
              <div className="flex gap-2 items-center bg-[#0d1117] px-3 py-2 rounded-md border border-[#30363d] min-w-0 w-full">
                <code className="flex-1 min-w-0 block truncate text-xs text-[#79c0ff] select-all">
                  {quickEmbedSnippet}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(quickEmbedSnippet, 'Live API Snippet')}
                  className="bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors"
                >
                  {copied === 'Live API Snippet' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Option 2: Full State Custom Link */}
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="font-bold text-xs text-[#58a6ff] uppercase tracking-wider">
                  2. Full Self-Contained Studio Snapshot URL
                </h3>
                <span className="text-[10px] bg-[#58a6ff]/15 text-[#58a6ff] border border-[#58a6ff]/30 px-2 py-0.5 rounded">
                  Includes Custom Uploaded Image
                </span>
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Encodes your custom uploaded ASCII art lines and all fields directly inside the URL query string:
              </p>
              <div className="flex gap-2 items-center bg-[#0d1117] px-3 py-2 rounded-md border border-[#30363d] min-w-0 w-full">
                <code className="flex-1 min-w-0 block truncate text-xs text-[#8b949e] select-all">
                  {fullEmbedSnippet}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(fullEmbedSnippet, 'Full Snapshot Link')}
                  className="bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white border border-[#30363d] px-3 py-1.5 rounded text-xs font-medium shrink-0 flex items-center gap-1.5 transition-colors"
                >
                  {copied === 'Full Snapshot Link' ? (
                    <Check className="w-3.5 h-3.5 text-[#3fb950]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Persistent Quick-Embed Bar */}
      <div className="shrink-0 px-3.5 py-2 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-[#c9d1d9] flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-[#3fb950]" />
            <span>README Embed:</span>
          </span>
          <div className="flex bg-[#0d1117] p-0.5 rounded border border-[#30363d] text-[10px]">
            <button
              type="button"
              onClick={() => setEmbedFormat('html')}
              className={`px-2 py-0.5 rounded transition-colors ${
                embedFormat === 'html'
                  ? 'bg-[#21262d] text-white font-bold'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              HTML &lt;img&gt;
            </button>
            <button
              type="button"
              onClick={() => setEmbedFormat('md')}
              className={`px-2 py-0.5 rounded transition-colors ${
                embedFormat === 'md'
                  ? 'bg-[#21262d] text-white font-bold'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              Markdown ![]
            </button>
          </div>
        </div>

        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1">
          <code className="flex-1 min-w-0 truncate text-[11px] text-[#79c0ff] select-all">
            {quickEmbedSnippet}
          </code>
          <button
            type="button"
            onClick={() => copyToClipboard(quickEmbedSnippet, 'README Embed Snippet')}
            className="bg-[#238636] hover:bg-[#2ea043] text-white text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1 shrink-0 transition-colors"
          >
            {copied === 'README Embed Snippet' ? (
              <>
                <Check className="w-3 h-3" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Snippet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
