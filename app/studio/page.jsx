'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CollapsibleCard from '@/components/CollapsibleCard';
import AsciiControls from '@/components/AsciiControls';
import FieldEditor from '@/components/FieldEditor';
import CustomThemePicker from '@/components/CustomThemePicker';
import PreviewPanel from '@/components/PreviewPanel';
import { Play } from 'lucide-react';

import { PRESETS } from '@/lib/presets';
import { fetchGitHubUser } from '@/lib/github-api';
import { imageToAscii, getDefaultAsciiAvatar } from '@/lib/ascii-engine';
import { buildStatsLines, mergeSideBySide, buildMarkdownCodeBlock } from '@/lib/neofetch-builder';

const INITIAL_STATE = {
  headerTitle: "username@github",
  headerSeparator: "---------------",
  animateCursor: true,
  animateTypewriter: true,
  animateFade: false,
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
    { key: "OS", value: "Windows 11, macOS 15, Linux" },
    { key: "Uptime", value: "3 years, 5 months, 12 days" },
    { key: "Host", value: "Full-Stack Developer / Open Source" },
    { key: "Kernel", value: "Software Engineer & Tech Creator" },
    { key: "IDE", value: "VSCode 1.96.0, Antigravity" },
    { key: "", value: "" },
    { key: "Languages.Programming", value: "TypeScript, Python, Rust, Go" },
    { key: "Languages.Computer", value: "HTML, CSS, SQL, JSON, YAML" },
    { key: "Languages.Real", value: "English, Turkish" },
    { key: "", value: "" },
    { key: "Hobbies.Software", value: "Open Source, Game Dev, AI/ML" },
    { key: "Hobbies.Hardware", value: "Custom Keyboards, 3D Printing" },
    { key: "", value: "" },
    { key: "SECTION: Contact", value: "Contact" },
    { key: "Email", value: "developer@example.com" },
    { key: "Website", value: "https://your-portfolio.dev" },
    { key: "LinkedIn", value: "/in/your-profile" },
    { key: "Twitter/X", value: "@your-handle" },
    { key: "Location", value: "Earth" },
    { key: "", value: "" },
    { key: "SECTION: GitHub Stats", value: "GitHub Stats" },
    { key: "Repos", value: "42 | Stars: 128" },
    { key: "Followers", value: "256 | Following: 48" }
  ]
};

export default function StudioPage() {
  const [state, setState] = useState(INITIAL_STATE);
  const [asciiLines, setAsciiLines] = useState(getDefaultAsciiAvatar());
  const [currentImgElement, setCurrentImgElement] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [ghInput, setGhInput] = useState('');
  const [isFetchingGh, setIsFetchingGh] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

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
        showToast('Resim başarıyla yüklendi!');
      };
      img.onerror = () => {
        const fallbackImg = new Image();
        fallbackImg.onload = () => setCurrentImgElement(fallbackImg);
        fallbackImg.onerror = () => showToast('Resim yüklenemedi.');
        fallbackImg.src = src;
      };
      img.src = finalSrc;
    } catch (e) {
      console.warn("Image load error:", e);
      showToast('Resim yüklenirken hata oluştu.');
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

  const [lastFetchedAvatarUrl, setLastFetchedAvatarUrl] = useState('');

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
        { key: "Languages.Programming", value: data.languages || "TypeScript, Python, Rust, Go" },
        { key: "Languages.Computer", value: "HTML, CSS, JSON, YAML, SQL" },
        { key: "Languages.Real", value: "English, Turkish" },
        { key: "", value: "" },
        { key: "Hobbies.Software", value: "Open Source, Game Dev, AI/ML" },
        { key: "Hobbies.Hardware", value: "Custom Keyboards, 3D Printing" },
        { key: "", value: "" },
        { key: "SECTION: Contact", value: "Contact" },
        { key: "Email", value: "your-email@gmail.com" },
        { key: "Website", value: data.blog || "https://your-website.dev" },
        { key: "LinkedIn", value: data.linkedin || "your-linkedin" },
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
    showToast(`@${username} GitHub profil resmi yükleniyor...`);
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
        showToast(`@${username} profil resmi başarıyla yüklendi!`);
      } else {
        showToast('GitHub profil resmi bulunamadı.');
      }
    } catch (err) {
      console.warn("Avatar restore failed:", err);
      showToast('GitHub profil resmi yüklenemedi.');
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
      <Header
        onQuickCopy={handleQuickCopy}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />

      {/* Main Grid */}
      <main className="flex-1 max-w-[1800px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6">
        {/* Left Controls Sidebar - 4-Step Wizard */}
        <aside data-lenis-prevent className="flex flex-col gap-4 lg:sticky lg:top-4 max-h-[calc(100vh-90px)] overflow-y-auto pr-2 custom-scrollbar">
          {/* Stepper Navigation Header */}
          <div className="bg-[#111827]/90 border border-white/10 p-3.5 rounded-2xl flex flex-col gap-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-200 tracking-wide uppercase font-mono">
                Design Studio Wizard
              </span>
              <span className="text-[11px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Step {activeStep} / 4
              </span>
            </div>

            {/* Step Selector Pills */}
            <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-white/5">
              {[
                { id: 1, label: "Profile", code: "01" },
                { id: 2, label: "ASCII", code: "02" },
                { id: 3, label: "Data", code: "03" },
                { id: 4, label: "Style", code: "04" }
              ].map(step => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                    activeStep === step.id
                      ? 'bg-indigo-600 text-white font-bold shadow-md scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <span className="text-[11px] font-mono font-bold text-indigo-300">{step.code}</span>
                  <span className="text-[10px] mt-0.5 font-mono">{step.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 1: Profile & Import */}
          {activeStep === 1 && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
                <h3 className="text-xs font-bold text-indigo-300 font-mono">
                  Step 1: Profile & Header Configuration
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Fetch your GitHub profile avatar automatically or customize your terminal header title.
                </p>
              </div>

              <CollapsibleCard title="GitHub Auto Import" icon="" defaultOpen={true}>
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] text-slate-400">Enter your GitHub username to auto-import your avatar & profile data:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. username"
                      value={ghInput}
                      onChange={(e) => setGhInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFetchGitHub()}
                      className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleFetchGitHub}
                      disabled={isFetchingGh}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all shrink-0"
                    >
                      {isFetchingGh ? 'Fetching...' : 'Fetch Profile'}
                    </button>
                  </div>
                </div>
              </CollapsibleCard>

              <CollapsibleCard title="Terminal Header & Title" icon="" defaultOpen={true}>
                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-medium">Terminal Title:</label>
                    <input
                      type="text"
                      value={state.headerTitle}
                      onChange={(e) => setState(prev => ({ ...prev, headerTitle: e.target.value }))}
                      className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-medium">Line Separator:</label>
                    <input
                      type="text"
                      value={state.headerSeparator}
                      onChange={(e) => setState(prev => ({ ...prev, headerSeparator: e.target.value }))}
                      className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </CollapsibleCard>
            </div>
          )}

          {/* STEP 2: ASCII Controls */}
          {activeStep === 2 && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
                <h3 className="text-xs font-bold text-indigo-300 font-mono">
                  Step 2: ASCII Art & Image Controls
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Upload custom image, select preset avatars, or adjust Sobel ASCII edge contrast.
                </p>
              </div>

              <CollapsibleCard title="ASCII Art Generator" icon="" defaultOpen={true}>
                <AsciiControls
                  state={state}
                  onChangeState={(partial) => setState(prev => ({ ...prev, ...partial }))}
                  onImageLoaded={handleImageLoaded}
                  onSelectPresetAscii={handleSelectPresetAscii}
                  onRestoreGitHubAvatar={handleRestoreGitHubAvatar}
                />
              </CollapsibleCard>
            </div>
          )}

          {/* STEP 3: Data Editor */}
          {activeStep === 3 && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
                <h3 className="text-xs font-bold text-indigo-300 font-mono">
                  Step 3: Neofetch Data & Info Editor
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Customize OS, Languages, Contact info, and GitHub Stats fields shown in your terminal card.
                </p>
              </div>

              <CollapsibleCard title="Neofetch Fields & Info Editor" icon="" defaultOpen={true}>
                <FieldEditor
                  fields={state.fields}
                  onChangeFields={(newFields) => setState(prev => ({ ...prev, fields: newFields }))}
                />
              </CollapsibleCard>
            </div>
          )}

          {/* STEP 4: Style & Animations */}
          {activeStep === 4 && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
                <h3 className="text-xs font-bold text-indigo-300 font-mono">
                  Step 4: Color Theme & Terminal Animations
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Select color palettes and enable pure CSS typewriter / cursor animations for your GitHub README.
                </p>
              </div>

              <CollapsibleCard title="Color Theme & Custom Colors" icon="" defaultOpen={true}>
                <div className="flex flex-col gap-3 text-xs">
                  <select
                    value={state.themeKey}
                    onChange={(e) => setState(prev => ({ ...prev, themeKey: e.target.value, customThemeEnabled: false }))}
                    className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer font-mono"
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

              <CollapsibleCard title="SVG Terminal Animations (CSS)" icon="" defaultOpen={true}>
                <div className="flex flex-col gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-200 hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={state.animateCursor}
                      onChange={(e) => setState(prev => ({ ...prev, animateCursor: e.target.checked }))}
                      className="accent-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Blinking Terminal Cursor (<code className="text-indigo-400 font-mono">_</code>)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-200 hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={state.animateTypewriter}
                      onChange={(e) => setState(prev => ({ ...prev, animateTypewriter: e.target.checked, animateFade: e.target.checked ? false : prev.animateFade }))}
                      className="accent-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Typewriter Keyboard Typing Animation</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-200 hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={state.animateFade}
                      onChange={(e) => setState(prev => ({ ...prev, animateFade: e.target.checked, animateTypewriter: e.target.checked ? false : prev.animateTypewriter }))}
                      className="accent-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Staggered Line Fade-In Effect</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setState(prev => ({ ...prev, animTrigger: (prev.animTrigger || 0) + 1 }))}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-md transition-all mt-1 border border-indigo-400/30"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-white" />
                    <span>Replay / Preview Animations</span>
                  </button>

                  <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-white/5 mt-1">
                    Pure CSS keyframe animations supported natively in GitHub READMEs without JavaScript.
                  </p>
                </div>
              </CollapsibleCard>
            </div>
          )}

          {/* Stepper Footer Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
            <button
              type="button"
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeStep === 1 ? 'opacity-30 cursor-not-allowed bg-slate-900 text-slate-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10'
              }`}
            >
              ← Previous Step
            </button>

            {activeStep < 4 ? (
              <button
                type="button"
                onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
                className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
              >
                Next Step →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setState(prev => ({ ...prev, animTrigger: (prev.animTrigger || 0) + 1 }))}
                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Replay Animations</span>
              </button>
            )}
          </div>
        </aside>

        {/* Right Live Preview Panel */}
        <section className="flex flex-col min-w-0 w-full">
          <PreviewPanel
            state={{ ...state, asciiLines }}
            onShowToast={showToast}
          />
        </section>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-indigo-600 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-2xl z-50 flex items-center gap-2 border border-indigo-400/30">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
