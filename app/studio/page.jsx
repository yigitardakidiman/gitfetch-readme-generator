'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CollapsibleCard from '@/components/CollapsibleCard';
import AsciiControls from '@/components/AsciiControls';
import FieldEditor from '@/components/FieldEditor';
import CustomThemePicker from '@/components/CustomThemePicker';
import PreviewPanel from '@/components/PreviewPanel';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, Download } from 'lucide-react';

import { PRESETS } from '@/lib/presets';
import { fetchGitHubUser } from '@/lib/github-api';
import { imageToAscii, getDefaultAsciiAvatar } from '@/lib/ascii-engine';
import { buildStatsLines, mergeSideBySide, buildMarkdownCodeBlock } from '@/lib/neofetch-builder';

const INITIAL_STATE = {
  headerTitle: "yigitardakidiman@github",
  headerSeparator: "-----------------------",
  themeKey: "dracula",
  customThemeEnabled: false,
  customTheme: {
    bg: "#090d16",
    cardBg: "#1e1f29",
    title: "#bd93f9",
    key: "#8be9fd",
    value: "#f1fa8c",
    ascii: "#ff79c6",
    separator: "#6272a4",
    dots: ["#ff5555", "#f1fa8c", "#50fa7b"]
  },
  asciiWidth: 55,
  customFontSize: 0,
  charSetKey: "detailed",
  contrast: 1.2,
  invert: false,
  autoEnhance: true,
  edgeSharpen: 0.4,
  bgThreshold: 0,
  dither: false,
  fields: [
    { key: "OS", value: "Windows 10" },
    { key: "Uptime", value: "1 years, 7 months, 12 days" },
    { key: "Host", value: "Freelance / Open Source" },
    { key: "Kernel", value: "just a sofwtare engineering student" },
    { key: "IDE", value: "VSCode, Antigravity" },
    { key: "", value: "" },
    { key: "Languages.Programming", value: "Python, JavaScript, C" },
    { key: "Languages.Computer", value: "HTML, CSS" },
    { key: "Languages.Real", value: "English, Turkish" },
    { key: "", value: "" },
    { key: "SECTION: Contact", value: "Contact" },
    { key: "Email", value: "yigitardakidiman@gmail.com" },
    { key: "Website", value: "https://www.kidiman.com/" },
    { key: "LinkedIn", value: "/in/yigitardakidiman" },
    { key: "Instagram", value: "@codewithkidiman" },
    { key: "Location", value: "Earth" },
    { key: "", value: "" },
    { key: "SECTION: GitHub Stats", value: "GitHub Stats" },
    { key: "Repos", value: "14 | Stars: 1" },
    { key: "Followers", value: "8  | Following: 6" }
  ]
};

export default function StudioPage() {
  const [state, setState] = useState(INITIAL_STATE);
  const [asciiLines, setAsciiLines] = useState(getDefaultAsciiAvatar());
  const [currentImgElement, setCurrentImgElement] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [ghInput, setGhInput] = useState('');
  const [isFetchingGh, setIsFetchingGh] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // ASCII Rendering effect

  // Re-render ASCII whenever parameters change
  useEffect(() => {
    let isMounted = true;
    const processImage = async () => {
      if (currentImgElement) {
        try {
          const lines = await imageToAscii(currentImgElement, {
            width: state.asciiWidth,
            charSetKey: state.charSetKey,
            contrast: state.contrast,
            invert: state.invert,
            autoEnhance: state.autoEnhance,
            edgeSharpen: state.edgeSharpen,
            bgThreshold: state.bgThreshold,
            dither: state.dither
          });
          if (isMounted) setAsciiLines(lines);
        } catch (e) {
          console.warn("ASCII rendering error:", e);
        }
      }
    };
    processImage();
    return () => { isMounted = false; };
  }, [
    currentImgElement,
    state.asciiWidth,
    state.charSetKey,
    state.contrast,
    state.invert,
    state.autoEnhance,
    state.edgeSharpen,
    state.bgThreshold,
    state.dither
  ]);

  const handleImageLoaded = async (src) => {
    try {
      let finalSrc = src;
      if (typeof src === 'string' && src.startsWith('http')) {
        const res = await fetch(src);
        if (res.ok) {
          const blob = await res.blob();
          finalSrc = URL.createObjectURL(blob);
        }
      }
      const img = new Image();
      img.onload = () => {
        setCurrentImgElement(img);
        showToast('Image loaded successfully!');
      };
      img.onerror = () => {
        showToast('Could not load image.');
      };
      img.src = finalSrc;
    } catch (e) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => setCurrentImgElement(img);
      img.src = src;
    }
  };

  const handleSelectPresetAscii = (presetLines) => {
    setCurrentImgElement(null);
    setAsciiLines(presetLines);
    showToast('Preset ASCII Avatar loaded!');
  };

  const handleSelectPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    const flatFields = [];
    preset.sections.forEach(sec => {
      sec.fields.forEach(f => flatFields.push({ ...f }));
    });

    setState(prev => ({
      ...prev,
      headerTitle: preset.title,
      headerSeparator: preset.separator,
      themeKey: preset.theme,
      fields: flatFields
    }));

    showToast(`Loaded preset: ${preset.name}`);
  };

  const handleFetchGitHub = async () => {
    if (!ghInput.trim()) return showToast('Please enter a GitHub username.');
    setIsFetchingGh(true);
    try {
      const data = await fetchGitHubUser(ghInput);

      const newTitle = `${data.username}@github`;
      const newSep = "-".repeat(newTitle.length);

      const newFields = [
        { key: "OS", value: "Windows 11, macOS 15, Linux" },
        { key: "Uptime", value: data.uptime },
        { key: "Host", value: data.company },
        { key: "Kernel", value: data.bio || "Open Source Developer" },
        { key: "IDE", value: "VSCode 1.96.0" },
        { key: "", value: "" },
        { key: "Languages.Programming", value: "TypeScript, Python, Rust, Go" },
        { key: "Languages.Computer", value: "HTML, CSS, JSON, YAML, SQL" },
        { key: "Languages.Real", value: "English, Turkish" },
        { key: "", value: "" },
        { key: "Hobbies.Software", value: "Open Source, Game Dev, AI/ML" },
        { key: "Hobbies.Hardware", value: "Custom Keyboards, 3D Printing" },
        { key: "", value: "" },
        { key: "SECTION: Contact", value: "Contact" },
        { key: "Email", value: "your-email@gmail.com" },
        { key: "Website", value: data.blog || "https://your-website.dev" },
        { key: "LinkedIn", value: "your-linkedin" },
        { key: "Twitter/X", value: data.twitter ? `@${data.twitter}` : "@your-handle" },
        { key: "Discord", value: data.username },
        { key: "Location", value: data.location },
        { key: "", value: "" },
        { key: "SECTION: GitHub Stats", value: "GitHub Stats" },
        { key: "Repos", value: `${data.publicRepos} | Stars: ${data.stars}` },
        { key: "Followers", value: `${data.followers} | Following: ${data.following}` }
      ];

      setState(prev => ({
        ...prev,
        headerTitle: newTitle,
        headerSeparator: newSep,
        fields: newFields
      }));

      if (data.avatarUrl) {
        handleImageLoaded(data.avatarUrl);
      }

      showToast(`Imported GitHub profile: @${data.username}`);
    } catch (err) {
      showToast(err.message || 'GitHub import failed.');
    } finally {
      setIsFetchingGh(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `readme_config_${state.headerTitle.split('@')[0] || 'profile'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('JSON Config exported!');
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          setState(prev => ({ ...prev, ...parsed }));
          showToast('JSON Config loaded!');
        } catch (err) {
          showToast('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleQuickCopy = () => {
    const statsLines = buildStatsLines(state.headerTitle, state.headerSeparator, [{ name: "", fields: state.fields }]);
    const merged = mergeSideBySide(asciiLines, statsLines);
    const md = buildMarkdownCodeBlock(merged);
    navigator.clipboard.writeText(md);
    showToast('Markdown code copied!');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-indigo-950/80 border-b border-indigo-500/20 px-6 py-2 flex items-center justify-between text-xs text-indigo-200">
        <Link href="/" className="flex items-center gap-1.5 hover:text-white font-medium transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Landing Page
        </Link>
        
        {/* JSON Save / Load Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1 hover:text-white font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Config JSON
          </button>
          <label className="flex items-center gap-1 hover:text-white font-medium transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Load JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <Header
        onQuickCopy={handleQuickCopy}
      />

      {/* Main Grid */}
      <main className="flex-1 max-w-[1800px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6">
        {/* Left Controls Sidebar */}
        <aside data-lenis-prevent className="flex flex-col gap-4 lg:sticky lg:top-4 max-h-[calc(100vh-90px)] overflow-y-auto pr-2">
          {/* GitHub Auto Import */}
          <CollapsibleCard title="GitHub Auto Import" icon="⚡" defaultOpen={false}>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter GitHub username"
                value={ghInput}
                onChange={(e) => setGhInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchGitHub()}
                className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleFetchGitHub}
                disabled={isFetchingGh}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all"
              >
                {isFetchingGh ? 'Fetching...' : 'Fetch'}
              </button>
            </div>
          </CollapsibleCard>

          {/* ASCII Art Generator */}
          <CollapsibleCard title="ASCII Art Generator" icon="🖼️" defaultOpen={false}>
            <AsciiControls
              state={state}
              onChangeState={(partial) => setState(prev => ({ ...prev, ...partial }))}
              onImageLoaded={handleImageLoaded}
              onSelectPresetAscii={handleSelectPresetAscii}
            />
          </CollapsibleCard>

          {/* Terminal Header */}
          <CollapsibleCard title="Terminal Header" icon="🖥️" defaultOpen={false}>
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Title Line:</label>
                <input
                  type="text"
                  value={state.headerTitle}
                  onChange={(e) => setState(prev => ({ ...prev, headerTitle: e.target.value }))}
                  className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Separator:</label>
                <input
                  type="text"
                  value={state.headerSeparator}
                  onChange={(e) => setState(prev => ({ ...prev, headerSeparator: e.target.value }))}
                  className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </CollapsibleCard>

          {/* Neofetch Fields */}
          <CollapsibleCard title="Neofetch Fields & Info Editor" icon="📊" defaultOpen={false}>
            <FieldEditor
              fields={state.fields}
              onChangeFields={(newFields) => setState(prev => ({ ...prev, fields: newFields }))}
            />
          </CollapsibleCard>

          {/* Theme Selection */}
          <CollapsibleCard title="Color Theme & Custom Colors" icon="🎨" defaultOpen={false}>
            <div className="flex flex-col gap-3 text-xs">
              <select
                value={state.themeKey}
                onChange={(e) => setState(prev => ({ ...prev, themeKey: e.target.value, customThemeEnabled: false }))}
                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="dracula">Dracula Dark</option>
                <option value="cyberpunk">Cyberpunk Neon</option>
                <option value="monokai">Monokai Pro</option>
                <option value="matrix">Matrix Emerald</option>
                <option value="nord">Nord Frost</option>
                <option value="solarized">Solarized Dark</option>
                <option value="amber">Retro Amber Terminal</option>
              </select>

              <div className="border-t border-white/10 pt-2 flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-200">
                  <input
                    type="checkbox"
                    checked={state.customThemeEnabled}
                    onChange={(e) => setState(prev => ({ ...prev, customThemeEnabled: e.target.checked }))}
                    className="accent-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Enable Custom Theme Color Builder</span>
                </label>

                {state.customThemeEnabled && (
                  <CustomThemePicker
                    theme={state.customTheme}
                    onChangeTheme={(newCustomTheme) => setState(prev => ({ ...prev, customTheme: newCustomTheme }))}
                  />
                )}
              </div>
            </div>
          </CollapsibleCard>
        </aside>

        {/* Right Live Preview Panel */}
        <section className="flex flex-col">
          <PreviewPanel
            state={{ ...state, asciiLines }}
            onShowToast={showToast}
          />
        </section>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-indigo-600 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <span>✨</span> {toastMessage}
        </div>
      )}
    </div>
  );
}
