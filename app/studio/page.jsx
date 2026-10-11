'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AsciiControls from '@/components/AsciiControls';
import FieldEditor from '@/components/FieldEditor';
import CustomThemePicker from '@/components/CustomThemePicker';
import PreviewPanel from '@/components/PreviewPanel';
import {
  Play,
  User,
  Cpu,
  ListTree,
  Palette,
  Github,
  Sparkles,
  RotateCcw,
  Check,
  Wand2,
  Terminal
} from 'lucide-react';

import { PRESETS, COLOR_THEMES } from '@/lib/presets';
import { fetchGitHubUser } from '@/lib/github-api';
import { imageToAscii, getDefaultAsciiAvatar } from '@/lib/ascii-engine';
import { buildStatsLines, mergeSideBySide, buildMarkdownCodeBlock } from '@/lib/neofetch-builder';

const INITIAL_STATE = {
  headerTitle: 'username@github',
  headerSeparator: '---------------',
  animateCursor: true,
  animateTypewriter: true,
  animateFade: false,
  themeKey: 'dracula',
  customThemeEnabled: false,
  customTheme: {
    bg: '#090d16',
    cardBg: '#1e1f29',
    title: '#bd93f9',
    key: '#8be9fd',
    value: '#f1fa8c',
    ascii: '#ff79c6',
    separator: '#6272a4',
    dots: ['#ff5555', '#f1fa8c', '#50fa7b']
  },
  asciiWidth: 55,
  customFontSize: 0,
  charSetKey: 'detailed',
  contrast: 1.2,
  invert: false,
  autoEnhance: true,
  edgeSharpen: 0.4,
  bgThreshold: 0,
  dither: false,
  fields: [
    { key: 'OS', value: 'Windows 11, macOS 15, Linux' },
    { key: 'Uptime', value: '3 years, 5 months, 12 days' },
    { key: 'Host', value: 'Full-Stack Developer / Open Source' },
    { key: 'Kernel', value: 'Software Engineer & Tech Creator' },
    { key: 'IDE', value: 'VSCode 1.96.0, Antigravity' },
    { key: '', value: '' },
    { key: 'Languages.Programming', value: 'TypeScript, Python, Rust, Go' },
    { key: 'Languages.Computer', value: 'HTML, CSS, SQL, JSON, YAML' },
    { key: 'Languages.Real', value: 'English, Turkish' },
    { key: '', value: '' },
    { key: 'Hobbies.Software', value: 'Open Source, Game Dev, AI/ML' },
    { key: 'Hobbies.Hardware', value: 'Custom Keyboards, 3D Printing' },
    { key: '', value: '' },
    { key: 'SECTION: Contact', value: 'Contact' },
    { key: 'Email', value: 'developer@example.com' },
    { key: 'Website', value: 'https://your-portfolio.dev' },
    { key: 'LinkedIn', value: '/in/your-profile' },
    { key: 'Twitter/X', value: '@your-handle' },
    { key: 'Location', value: 'Earth' },
    { key: '', value: '' },
    { key: 'SECTION: GitHub Stats', value: 'GitHub Stats' },
    { key: 'Repos', value: '42 | Stars: 128' },
    { key: 'Followers', value: '256 | Following: 48' }
  ]
};

const NAV_ITEMS = [
  {
    id: 1,
    key: 'profile',
    label: 'Profile',
    title: 'Profile & Templates',
    subtitle: 'Import GitHub data, pick a template, or edit header',
    icon: User
  },
  {
    id: 2,
    key: 'ascii',
    label: 'ASCII',
    title: 'ASCII Art Engine',
    subtitle: 'Convert avatar images or choose built-in vector art',
    icon: Cpu
  },
  {
    id: 3,
    key: 'fields',
    label: 'Fields',
    title: 'System & Info Fields',
    subtitle: 'Drag to reorder, edit key-value rows, or add sections',
    icon: ListTree
  },
  {
    id: 4,
    key: 'theme',
    label: 'Theme',
    title: 'Theme & Animations',
    subtitle: 'Color syntax palettes and pure CSS SVG animations',
    icon: Palette
  }
];

export default function StudioPage() {
  const [state, setState] = useState(INITIAL_STATE);
  const [asciiLines, setAsciiLines] = useState(getDefaultAsciiAvatar());
  const [currentImgElement, setCurrentImgElement] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [ghInput, setGhInput] = useState('');
  const [isFetchingGh, setIsFetchingGh] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [lastFetchedAvatarUrl, setLastFetchedAvatarUrl] = useState('');
  const [activePresetName, setActivePresetName] = useState('neofetch');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Apply ?theme= query param when navigating from Landing Page theme selector
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme');
    if (themeParam && COLOR_THEMES[themeParam]) {
      setState((prev) => ({
        ...prev,
        themeKey: themeParam,
        customThemeEnabled: false
      }));
    }
  }, []);

  // Re-render ASCII whenever parameters change (debounced for smooth 60fps slider dragging)
  useEffect(() => {
    if (!currentImgElement) return;
    let isMounted = true;
    const timer = setTimeout(async () => {
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
        console.warn('ASCII rendering error:', e);
      }
    }, 35);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
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
        try {
          const res = await fetch(src, { mode: 'cors' });
          if (res.ok) {
            const blob = await res.blob();
            finalSrc = URL.createObjectURL(blob);
          }
        } catch (_) {}
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setCurrentImgElement(img);
        showToast('Image converted to ASCII!');
      };
      img.onerror = () => {
        const fallbackImg = new Image();
        fallbackImg.onload = () => setCurrentImgElement(fallbackImg);
        fallbackImg.onerror = () => showToast('Could not load image from source.');
        fallbackImg.src = src;
      };
      img.src = finalSrc;
    } catch (e) {
      console.warn('Image load error:', e);
      showToast('Error processing image.');
    }
  };

  const handleSelectPresetAscii = (presetLines) => {
    setCurrentImgElement(null);
    setAsciiLines(presetLines);
    showToast('ASCII preset loaded!');
  };

  const handleSelectPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    const flatFields = [];
    preset.sections.forEach((sec) => {
      if (sec.name) {
        flatFields.push({ key: `SECTION: ${sec.name}`, value: sec.name });
      }
      sec.fields.forEach((f) => flatFields.push({ ...f }));
    });

    setActivePresetName(presetKey);
    setState((prev) => ({
      ...prev,
      headerTitle: preset.title,
      headerSeparator: preset.separator,
      themeKey: preset.theme,
      customThemeEnabled: false,
      fields: flatFields
    }));

    showToast(`Template applied: ${preset.name}`);
  };

  const handleFetchGitHub = async () => {
    if (!ghInput.trim()) return showToast('Please enter a GitHub username.');
    setIsFetchingGh(true);
    try {
      const data = await fetchGitHubUser(ghInput.trim());

      const newTitle = `${data.username}@github`;
      const newSep = '-'.repeat(newTitle.length);

      const newFields = [
        { key: 'OS', value: 'Windows 11, macOS 15, Linux' },
        { key: 'Uptime', value: data.uptime },
        { key: 'Host', value: data.company },
        { key: 'Kernel', value: data.bio || 'Open Source Developer' },
        { key: 'IDE', value: 'VSCode 1.96.0' },
        { key: '', value: '' },
        { key: 'Languages.Programming', value: data.languages || 'TypeScript, Python, Rust, Go' },
        { key: 'Languages.Computer', value: 'HTML, CSS, JSON, YAML, SQL' },
        { key: 'Languages.Real', value: 'English, Turkish' },
        { key: '', value: '' },
        { key: 'Hobbies.Software', value: 'Open Source, Game Dev, AI/ML' },
        { key: 'Hobbies.Hardware', value: 'Custom Keyboards, 3D Printing' },
        { key: '', value: '' },
        { key: 'SECTION: Contact', value: 'Contact' },
        { key: 'Email', value: data.email || 'your-email@gmail.com' },
        { key: 'Website', value: data.blog || 'https://your-website.dev' },
        { key: 'LinkedIn', value: data.linkedin || 'your-linkedin' },
        { key: 'Twitter/X', value: data.twitter ? `@${data.twitter}` : '@your-handle' },
        { key: 'Discord', value: data.username },
        { key: 'Location', value: data.location },
        { key: '', value: '' },
        { key: 'SECTION: GitHub Stats', value: 'GitHub Stats' },
        { key: 'Repos', value: `${data.publicRepos} | Stars: ${data.stars}` },
        { key: 'Followers', value: `${data.followers} | Following: ${data.following}` }
      ];

      setState((prev) => ({
        ...prev,
        headerTitle: newTitle,
        headerSeparator: newSep,
        fields: newFields
      }));

      if (data.avatarUrl) {
        setLastFetchedAvatarUrl(data.avatarUrl);
        handleImageLoaded(data.avatarUrl);
      }

      showToast(`Imported GitHub profile: @${data.username}`);
    } catch (err) {
      showToast(err.message || 'GitHub import failed.');
    } finally {
      setIsFetchingGh(false);
    }
  };

  const handleRestoreGitHubAvatar = async () => {
    const rawUser = state.headerTitle.split('@')[0] || ghInput || 'username';
    const username = rawUser.trim().replace(/^@/, '');
    showToast(`Fetching @${username} GitHub avatar...`);
    try {
      let targetUrl = lastFetchedAvatarUrl;
      if (!targetUrl) {
        const data = await fetchGitHubUser(username);
        if (data && data.avatarUrl) {
          targetUrl = data.avatarUrl;
          setLastFetchedAvatarUrl(targetUrl);
        }
      }
      if (targetUrl) {
        await handleImageLoaded(targetUrl);
        showToast(`@${username} avatar restored!`);
      } else {
        showToast('GitHub avatar not found.');
      }
    } catch (err) {
      console.warn('Avatar restore failed:', err);
      showToast('Failed to load GitHub avatar.');
    }
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `gitfetch_config_${state.headerTitle.split('@')[0] || 'profile'}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('JSON configuration exported!');
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          setState((prev) => ({ ...prev, ...parsed }));
          showToast('JSON configuration imported!');
        } catch (err) {
          showToast('Invalid JSON configuration file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleQuickCopy = () => {
    const statsLines = buildStatsLines(state.headerTitle, state.headerSeparator, [
      { name: '', fields: state.fields }
    ]);
    const merged = mergeSideBySide(asciiLines, statsLines);
    const md = buildMarkdownCodeBlock(merged);
    navigator.clipboard.writeText(md);
    showToast('Markdown code block copied!');
  };

  const handleMatchSeparator = (char = '-') => {
    const len = Math.max(3, state.headerTitle.trim().length);
    setState((prev) => ({
      ...prev,
      headerSeparator: char.repeat(len)
    }));
  };

  const activeNav = NAV_ITEMS.find((item) => item.id === activeStep) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-[#0d1117] text-[#c9d1d9] font-mono">
      <Header
        onQuickCopy={handleQuickCopy}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onSelectPreset={handleSelectPreset}
        currentTitle={state.headerTitle}
      />

      {/* IDE Workspace Container */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left IDE Activity Bar (Vertical on Desktop, Horizontal on Mobile) */}
        <nav
          aria-label="Studio Tools"
          className="bg-[#161b22] border-b lg:border-b-0 lg:border-r border-[#30363d] flex lg:flex-col items-center justify-between px-2 py-1.5 lg:py-3 lg:px-0 lg:w-16 shrink-0 select-none z-30"
        >
          <div className="flex lg:flex-col items-center gap-1 w-full">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeStep === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveStep(item.id)}
                  className={`relative flex-1 lg:flex-none lg:w-full flex flex-col items-center justify-center py-2 lg:py-3 px-2 transition-colors group ${
                    isActive
                      ? 'text-white bg-[#21262d]/80 lg:bg-transparent'
                      : 'text-[#8b949e] hover:text-[#c9d1d9]'
                  }`}
                  title={item.title}
                >
                  {/* Active Left Indicator Bar (Desktop) / Bottom Bar (Mobile) */}
                  {isActive && (
                    <span className=" -bottom-[6px] left-2 right-2 h-0.5 lg:top-1.5 lg:bottom-1.5 lg:left-0 lg:right-auto lg:w-[3px] lg:h-auto bg-[#58a6ff] rounded-full absolute" />
                  )}

                  <div
                    className={`p-1.5 rounded-md transition-colors ${
                      isActive ? 'bg-[#58a6ff]/15 text-[#58a6ff]' : 'group-hover:bg-[#21262d]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] mt-1 font-medium tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Quick Utility Actions on Desktop Rail */}
          <div className="hidden lg:flex flex-col items-center gap-2 pt-3 border-t border-[#30363d] w-full">
            <button
              type="button"
              onClick={() =>
                setState((prev) => ({ ...prev, animTrigger: (prev.animTrigger || 0) + 1 }))
              }
              className="p-2 rounded-md text-[#8b949e] hover:text-[#3fb950] hover:bg-[#21262d] transition-colors"
              title="Replay SVG Animations"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => {
                setState(INITIAL_STATE);
                setCurrentImgElement(null);
                setAsciiLines(getDefaultAsciiAvatar());
                showToast('Studio reset to default state');
              }}
              className="p-2 rounded-md text-[#8b949e] hover:text-[#f85149] hover:bg-[#21262d] transition-colors"
              title="Reset All Studio Settings"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </nav>

        {/* Left Active Tool Panel */}
        <aside
          data-lenis-prevent
          className="w-full lg:w-[390px] xl:w-[420px] shrink-0 bg-[#0d1117] border-b lg:border-b-0 lg:border-r border-[#30363d] flex flex-col max-h-[55vh] lg:max-h-none lg:h-full overflow-hidden"
        >
          {/* Tool Panel Header */}
          <div className="px-4 py-3 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>{activeNav.title}</span>
              </h2>
              <p className="text-[11px] text-[#8b949e] mt-0.5">{activeNav.subtitle}</p>
            </div>
            {activeStep === 3 && (
              <button
                type="button"
                onClick={() => {
                  setState((prev) => ({ ...prev, fields: INITIAL_STATE.fields }));
                  showToast('Default fields restored');
                }}
                className="text-[10px] text-[#8b949e] hover:text-white bg-[#21262d] hover:bg-[#30363d] px-2 py-1 rounded border border-[#30363d] transition-colors shrink-0"
              >
                Reset Fields
              </button>
            )}
          </div>

          {/* Tool Panel Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {/* PANEL 1: PROFILE & TEMPLATES */}
            {activeStep === 1 && (
              <div className="flex flex-col gap-5 animate-fadeIn text-xs">
                {/* GitHub Auto-Import */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3.5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9d1d9] flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-[#58a6ff]" />
                      GitHub Profile Auto-Import
                    </span>
                    {lastFetchedAvatarUrl && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#3fb950] bg-[#238636]/20 border border-[#3fb950]/30 px-2 py-0.5 rounded">
                        <Check className="w-2.5 h-2.5" /> Synced
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#8b949e] leading-relaxed">
                    Fetch your public repositories, star count, bio, languages, and convert your GitHub avatar into ASCII automatically.
                  </p>

                  <div className="flex gap-1.5">
                    <div className="relative flex-1 flex items-center">
                      <span className="text-[#8b949e] text-xs absolute left-2.5 select-none">@</span>
                      <input
                        type="text"
                        placeholder="github-username"
                        value={ghInput}
                        onChange={(e) => setGhInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFetchGitHub()}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-7 pr-3 py-2 text-xs text-white placeholder-[#8b949e]/60 focus:outline-none focus:border-[#58a6ff]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleFetchGitHub}
                      disabled={isFetchingGh}
                      className="bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-md border border-[#3fb950]/40 transition-colors shrink-0"
                    >
                      {isFetchingGh ? 'Syncing...' : 'Import'}
                    </button>
                  </div>
                </div>

                {/* Terminal Header & Separator */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3.5 flex flex-col gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9d1d9] flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#3fb950]" />
                    Terminal Prompt Header
                  </span>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[#8b949e] text-[11px] font-medium">
                      User@Hostname Header
                    </label>
                    <input
                      type="text"
                      value={state.headerTitle}
                      onChange={(e) =>
                        setState((prev) => ({ ...prev, headerTitle: e.target.value }))
                      }
                      placeholder="username@github"
                      className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[#8b949e] text-[11px] font-medium">
                        Divider Line
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMatchSeparator('-')}
                          className="text-[10px] bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] px-2 py-0.5 rounded border border-[#30363d] flex items-center gap-1"
                          title="Match title length with dashes (-)"
                        >
                          <Wand2 className="w-2.5 h-2.5 text-[#58a6ff]" />
                          <span>Fit (-)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMatchSeparator('=')}
                          className="text-[10px] bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] px-2 py-0.5 rounded border border-[#30363d]"
                          title="Match title length with double lines (=)"
                        >
                          Fit (=)
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={state.headerSeparator}
                      onChange={(e) =>
                        setState((prev) => ({ ...prev, headerSeparator: e.target.value }))
                      }
                      className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                    />
                  </div>
                </div>

                {/* Starter Templates */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3.5 flex flex-col gap-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9d1d9] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#58a6ff]" />
                    Starter Card Templates
                  </span>
                  <p className="text-[11px] text-[#8b949e]">
                    Load a pre-configured field layout and matching color theme:
                  </p>

                  <div className="flex flex-col gap-2 mt-0.5">
                    {Object.entries(PRESETS).map(([key, preset]) => {
                      const isSelected = activePresetName === key;
                      const presetTheme = COLOR_THEMES[preset.theme] || COLOR_THEMES.dracula;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectPreset(key)}
                          className={`flex items-center justify-between p-2.5 rounded-md border text-left transition-all ${
                            isSelected
                              ? 'bg-[#58a6ff]/15 border-[#58a6ff] text-white'
                              : 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9] hover:border-[#8b949e]'
                          }`}
                        >
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-bold text-xs truncate">{preset.name}</span>
                            <span className="text-[10px] text-[#8b949e] font-mono">
                              {preset.title} • {presetTheme.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {presetTheme.dots.map((dot, idx) => (
                              <span
                                key={idx}
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: dot }}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 2: ASCII CONTROLS */}
            {activeStep === 2 && (
              <div className="animate-fadeIn">
                <AsciiControls
                  state={state}
                  onChangeState={(partial) => setState((prev) => ({ ...prev, ...partial }))}
                  onImageLoaded={handleImageLoaded}
                  onSelectPresetAscii={handleSelectPresetAscii}
                  onRestoreGitHubAvatar={handleRestoreGitHubAvatar}
                  hasCustomImage={Boolean(currentImgElement)}
                />
              </div>
            )}

            {/* PANEL 3: DATA / FIELDS EDITOR */}
            {activeStep === 3 && (
              <div className="animate-fadeIn">
                <FieldEditor
                  fields={state.fields}
                  onChangeFields={(newFields) =>
                    setState((prev) => ({ ...prev, fields: newFields }))
                  }
                />
              </div>
            )}

            {/* PANEL 4: THEME & ANIMATIONS */}
            {activeStep === 4 && (
              <div className="flex flex-col gap-5 animate-fadeIn text-xs">
                {/* Visual Color Themes Grid */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3.5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9d1d9] flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#58a6ff]" />
                      Color Syntax Palettes
                    </span>
                    <span className="text-[10px] text-[#8b949e]">
                      {Object.keys(COLOR_THEMES).length} presets
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(COLOR_THEMES).map(([key, t]) => {
                      const isSelected = !state.customThemeEnabled && state.themeKey === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setState((prev) => ({
                              ...prev,
                              themeKey: key,
                              customThemeEnabled: false
                            }))
                          }
                          className={`p-2.5 rounded-md border text-left flex flex-col gap-1.5 transition-all ${
                            isSelected
                              ? 'border-[#58a6ff] ring-1 ring-[#58a6ff]'
                              : 'border-[#30363d] hover:border-[#8b949e]'
                          }`}
                          style={{ backgroundColor: t.cardBg }}
                        >
                          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                            <span
                              className="font-bold text-[11px] truncate"
                              style={{ color: t.title }}
                            >
                              {t.name}
                            </span>
                            <div className="flex gap-1 shrink-0">
                              {t.dots.map((d, i) => (
                                <span
                                  key={i}
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: d }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-[10px] space-y-0.5 font-mono">
                            <div className="truncate">
                              <span style={{ color: t.key }}>OS:</span>{' '}
                              <span style={{ color: t.value }}>Linux</span>
                            </div>
                            <div className="truncate" style={{ color: t.ascii }}>
                              @#%*+=:-.
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Theme Builder Toggle */}
                  <div className="border-t border-[#30363d] pt-3 flex flex-col gap-2.5">
                    <label className="flex items-center justify-between p-2 rounded-md bg-[#0d1117] border border-[#30363d] cursor-pointer hover:border-[#8b949e] transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[#c9d1d9] font-semibold text-[11px]">
                          Custom Color Palette
                        </span>
                        <span className="text-[10px] text-[#8b949e]">
                          Override individual syntax colors
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={state.customThemeEnabled}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            customThemeEnabled: e.target.checked
                          }))
                        }
                        className="accent-[#238636] w-4 h-4 cursor-pointer rounded"
                      />
                    </label>

                    {state.customThemeEnabled && (
                      <CustomThemePicker
                        theme={state.customTheme}
                        onChangeTheme={(newCustomTheme) =>
                          setState((prev) => ({ ...prev, customTheme: newCustomTheme }))
                        }
                      />
                    )}
                  </div>
                </div>

                {/* SVG Terminal Animations */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3.5 flex flex-col gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9d1d9] flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-[#3fb950]" />
                    SVG CSS Animations
                  </span>

                  <div className="flex flex-col gap-2">
                    <label className="flex items-center justify-between p-2.5 rounded-md bg-[#0d1117] border border-[#30363d] cursor-pointer hover:border-[#8b949e] transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[#c9d1d9] font-semibold text-[11px]">
                          Blinking Prompt Cursor (<code className="text-[#58a6ff]">_</code>)
                        </span>
                        <span className="text-[10px] text-[#8b949e]">
                          Active terminal cursor pulse at bottom
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={state.animateCursor}
                        onChange={(e) =>
                          setState((prev) => ({ ...prev, animateCursor: e.target.checked }))
                        }
                        className="accent-[#238636] w-4 h-4 cursor-pointer rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-md bg-[#0d1117] border border-[#30363d] cursor-pointer hover:border-[#8b949e] transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[#c9d1d9] font-semibold text-[11px]">
                          Typewriter Boot Sequence
                        </span>
                        <span className="text-[10px] text-[#8b949e]">
                          Reveals system stats character by character
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={state.animateTypewriter}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            animateTypewriter: e.target.checked,
                            animateFade: e.target.checked ? false : prev.animateFade
                          }))
                        }
                        className="accent-[#238636] w-4 h-4 cursor-pointer rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-md bg-[#0d1117] border border-[#30363d] cursor-pointer hover:border-[#8b949e] transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[#c9d1d9] font-semibold text-[11px]">
                          Staggered Line Fade-In
                        </span>
                        <span className="text-[10px] text-[#8b949e]">
                          Smooth vertical cascade on load
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={state.animateFade}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            animateFade: e.target.checked,
                            animateTypewriter: e.target.checked ? false : prev.animateTypewriter
                          }))
                        }
                        className="accent-[#238636] w-4 h-4 cursor-pointer rounded"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        animTrigger: (prev.animTrigger || 0) + 1
                      }))
                    }
                    className="w-full flex items-center justify-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-xs py-2.5 px-3 rounded-md border border-[#3fb950]/40 transition-colors mt-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Test / Replay SVG Animations</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Live Preview Stage */}
        <main
          data-lenis-prevent
          className="flex-1 flex flex-col min-w-0 p-3 sm:p-4 lg:p-5 bg-[#0d1117] overflow-y-auto"
        >
          <PreviewPanel state={{ ...state, asciiLines }} onShowToast={showToast} />
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-[#161b22] text-white font-mono text-xs px-4 py-2.5 rounded-md shadow-2xl z-50 flex items-center gap-2.5 border border-[#3fb950]/50 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-[#3fb950]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
