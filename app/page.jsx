'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Terminal,
  Sliders,
  Sparkles,
  Code2,
  RefreshCw
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { COLOR_THEMES } from '@/lib/presets';
import { getDefaultAsciiAvatar } from '@/lib/ascii-engine';
import { buildStatsLines } from '@/lib/neofetch-builder';
import { generateSvgCard } from '@/lib/svg-exporter';
import LetterGlitch from '@/components/LetterGlitch';

const HERO_FIELDS = [
  { key: 'OS', value: 'Windows 10' },
  { key: 'Uptime', value: '1 year, 7 months, 12 days' },
  { key: 'Host', value: 'Freelance / Open Source' },
  { key: 'Kernel', value: 'Software Engineering Student' },
  { key: 'IDE', value: 'VSCode, Antigravity' },
  { key: '', value: '' },
  { key: 'Languages.Programming', value: 'Python, JavaScript, C' },
  { key: 'Languages.Computer', value: 'HTML, CSS' },
  { key: 'Languages.Real', value: 'English, Turkish' },
  { key: '', value: '' },
  { key: 'SECTION: Contact', value: 'Contact' },
  { key: 'Email', value: 'yigitardakidiman@gmail.com' },
  { key: 'Website', value: 'https://www.kidiman.com/' },
  { key: 'LinkedIn', value: '/in/yigitardakidiman' },
  { key: 'Instagram', value: '@codewithkidiman' },
  { key: 'Location', value: 'Earth' },
  { key: '', value: '' },
  { key: 'SECTION: GitHub Stats', value: 'GitHub Stats' },
  { key: 'Repos', value: '14 | Stars: 1' },
  { key: 'Followers', value: '18 | Following: 6' }
];

// Clean Base64URL-encoded config (typo-free) for the live /api/svg showcase
const HERO_CONFIG_B64 =
  'eyJmaWVsZHMiOlt7ImtleSI6Ik9TIiwidmFsdWUiOiJXaW5kb3dzIDEwIn0seyJrZXkiOiJVcHRpbWUiLCJ2YWx1ZSI6IjEgeWVhciwgNyBtb250aHMsIDEyIGRheXMifSx7ImtleSI6Ikhvc3QiLCJ2YWx1ZSI6IkZyZWVsYW5jZSAvIE9wZW4gU291cmNlIn0seyJrZXkiOiJLZXJuZWwiLCJ2YWx1ZSI6IlNvZnR3YXJlIEVuZ2luZWVyaW5nIFN0dWRlbnQifSx7ImtleSI6IklERSIsInZhbHVlIjoiVlNDb2RlLCBBbnRpZ3Jhdml0eSJ9LHsia2V5IjoiIiwidmFsdWUiOiIifSx7ImtleSI6Ikxhbmd1YWdlcy5Qcm9ncmFtbWluZyIsInZhbHVlIjoiUHl0aG9uLCBKYXZhU2NyaXB0LCBDIn0seyJrZXkiOiJMYW5ndWFnZXMuQ29tcHV0ZXIiLCJ2YWx1ZSI6IkhUTUwsIENTUyJ9LHsia2V5IjoiTGFuZ3VhZ2VzLlJlYWwiLCJ2YWx1ZSI6IkVuZ2xpc2gsIFR1cmtpc2gifSx7ImtleSI6IiIsInZhbHVlIjoiIn0seyJrZXkiOiJTRUNUSU9OOiBDb250YWN0IiwidmFsdWUiOiJDb250YWN0In0seyJrZXkiOiJFbWFpbCIsInZhbHVlIjoieWlnaXRhcmRha2lkaW1hbkBnbWFpbC5jb20ifSx7ImtleSI6IldlYnNpdGUiLCJ2YWx1ZSI6Imh0dHBzOi8vd3d3LmtpZGltYW4uY29tLyJ9LHsia2V5IjoiTGlua2VkSW4iLCJ2YWx1ZSI6Ii9pbi95aWdpdGFyZGFraWRpbWFuIn0seyJrZXkiOiJJbnN0YWdyYW0iLCJ2YWx1ZSI6IkBjb2Rld2l0aGtpZGltYW4ifSx7ImtleSI6IkxvY2F0aW9uIiwidmFsdWUiOiJFYXJ0aCJ9LHsia2V5IjoiIiwidmFsdWUiOiIifSx7ImtleSI6IlNFQ1RJT046IEdpdEh1YiBTdGF0cyIsInZhbHVlIjoiR2l0SHViIFN0YXRzIn0seyJrZXkiOiJSZXBvcyIsInZhbHVlIjoiMTQgfCBTdGFyczogMSJ9LHsia2V5IjoiRm9sbG93ZXJzIiwidmFsdWUiOiIxOCB8IEZvbGxvd2luZzogNiJ9XSwiaGVhZGVyVGl0bGUiOiJ5aWdpdGFyZGFraWRpbWFuQGdpdGh1YiIsImhlYWRlclNlcGFyYXRvciI6Ii0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIiwiY3VzdG9tVGhlbWUiOm51bGx9';

const MINI_ASCII_SAMPLE = [
  '   .---.   ',
  '  /     \\  ',
  ' | () () | ',
  '  \\  ^  /  ',
  '   `---\'   '
];

export default function LandingPage() {
  const [activeTheme, setActiveTheme] = useState('matrix');
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const currentThemeObj = COLOR_THEMES[activeTheme] || COLOR_THEMES.matrix;

  const heroSvgUrl = `/api/svg?user=yigitardakidiman&theme=${activeTheme}&asciiWidth=75&edgeSharpen=0&contrast=1.7&config=${HERO_CONFIG_B64}`;

  const fallbackSvgMarkup = useMemo(() => {
    const statsLines = buildStatsLines(
      'yigitardakidiman@github',
      '-----------------------',
      [{ name: '', fields: HERO_FIELDS }]
    );
    return generateSvgCard(getDefaultAsciiAvatar(), statsLines, {
      themeKey: activeTheme,
      isStudioPreview: true
    });
  }, [activeTheme]);

  const handleSelectTheme = (themeKey) => {
    if (themeKey === activeTheme) return;
    setImgError(false);
    setImgLoading(true);
    setActiveTheme(themeKey);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-[#238636] selection:text-white">
      {/* Top Navbar */}
      <nav
        aria-label="Primary Navigation"
        className="border-b border-[#30363d] bg-[#161b22]/90 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-[#0d1117] border border-[#30363d] hover:border-[#58a6ff] text-[#58a6ff] px-2.5 py-1 rounded text-xs font-bold font-mono flex items-center gap-1.5 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-[#3fb950]" />
              <span>$ gitfetch</span>
            </Link>
            <span className="text-xs text-[#8b949e] font-mono hidden sm:inline-block">v1.0.0</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono text-[#8b949e] overflow-x-auto">
            <a href="#themes" className="hover:text-[#58a6ff] transition-colors whitespace-nowrap">
              /themes
            </a>
            <a href="#workflow" className="hover:text-[#58a6ff] transition-colors whitespace-nowrap">
              /workflow
            </a>
            <a href="#faq" className="hover:text-[#58a6ff] transition-colors whitespace-nowrap">
              /faq
            </a>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/studio?theme=${activeTheme}`}
              className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold font-mono px-3.5 sm:px-4 py-2 rounded-md border border-[#3fb950]/40 shadow-sm flex items-center gap-2 transition-colors"
            >
              <span>$ launch-studio</span>
              <span aria-hidden="true">_</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-16 pb-20 px-4 sm:px-6 overflow-hidden flex flex-col items-center justify-center border-b border-[#30363d]">
        {/* Background LetterGlitch Canvas */}
        <div className="absolute inset-0 z-0 opacity-35 pointer-events-none" aria-hidden="true">
          <LetterGlitch
            glitchColors={['#10b981', '#06b6d4', '#238636', '#30363d']}
            glitchSpeed={100}
            centerVignette={true}
            outerVignette={true}
            smooth={false}
          />
        </div>

        <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center gap-5 relative z-10">
          <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-white max-w-4xl leading-[1.12]">
            Terminal Profile Cards For Your{' '}
            <span className="text-[#58a6ff] font-mono">GitHub README.md</span>
          </h1>

          <p className="text-[#9ca3af] text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
            Convert your GitHub avatar into directional Sobel ASCII art beside live system stats,
            custom color syntax, and a zero-maintenance SVG API endpoint.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full sm:w-auto">
            <Link
              href={`/studio?theme=${activeTheme}`}
              className="w-full sm:w-auto bg-[#238636] hover:bg-[#2ea043] text-white font-bold font-mono text-xs sm:text-sm px-7 py-3.5 rounded-md border border-[#3fb950]/40 shadow-lg flex items-center justify-center gap-2.5 transition-colors"
            >
              <span>$ open-studio --theme={activeTheme}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Interactive Hero Showcase Frame */}
          <div className="w-full max-w-4xl mt-6 bg-[#161b22]/95 border border-[#30363d] rounded-xl overflow-hidden shadow-2xl text-left">
            {/* Interactive Theme Switcher Toolbar */}
            <div className="px-3.5 py-2.5 bg-[#0d1117] border-b border-[#30363d] flex items-center justify-between gap-2 flex-wrap lg:flex-nowrap">
              <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                <span className="text-xs font-mono font-semibold text-[#c9d1d9]">
                  Live Theme Preview:
                </span>
                {imgLoading && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#58a6ff]">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>rendering...</span>
                  </span>
                )}
              </div>

              <div
                role="group"
                aria-label="Select terminal color theme"
                className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5"
              >
                {Object.entries(COLOR_THEMES).map(([key, t]) => {
                  const isSelected = activeTheme === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => handleSelectTheme(key)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono transition-colors shrink-0 border ${
                        isSelected
                          ? 'bg-[#21262d] text-white font-bold border-[#58a6ff]'
                          : 'bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9] border-[#30363d]'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: t.ascii }}
                      />
                      <span>{t.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live SVG Stage */}
            <div className="p-3 sm:p-5 bg-[#090d13] flex items-center justify-center min-h-[260px] sm:min-h-[380px] relative">
              {!imgError ? (
                <img
                  key={heroSvgUrl}
                  src={heroSvgUrl}
                  alt={`GitFetch Terminal Card preview in ${currentThemeObj.name} theme`}
                  width={740}
                  height={420}
                  onLoad={() => setImgLoading(false)}
                  onError={() => {
                    setImgLoading(false);
                    setImgError(true);
                  }}
                  className={`max-w-[740px] w-full h-auto rounded-lg shadow-xl transition-opacity duration-200 ${
                    imgLoading ? 'opacity-60' : 'opacity-100'
                  }`}
                />
              ) : (
                <div
                  className="max-w-[740px] w-full flex justify-center overflow-hidden rounded-lg shadow-xl"
                  dangerouslySetInnerHTML={{ __html: fallbackSvgMarkup }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: All 8 Interactive Color Themes */}
      <section id="themes" className="py-20 px-4 sm:px-6 bg-[#161b22]/40 border-b border-[#30363d]">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                8 Terminal Syntax Palettes — Click Any Theme to Preview
              </h2>
              <p className="text-sm sm:text-base text-[#9ca3af] leading-relaxed">
                Every preset separates title, key, dot leader, value, and ASCII portrait tokens.
                Select any palette below to update the live hero terminal card above or open it
                directly in Studio.
              </p>
            </div>
            <Link
              href={`/studio?theme=${activeTheme}`}
              className="shrink-0 bg-[#21262d] hover:bg-[#30363d] text-white font-mono text-xs font-bold px-4 py-2.5 rounded-md border border-[#30363d] flex items-center gap-2 transition-colors self-start sm:self-auto"
            >
              <span>Open {currentThemeObj.name} in Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#58a6ff]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(COLOR_THEMES).map(([key, theme]) => {
              const isSelected = activeTheme === key;
              return (
                <div
                  key={key}
                  onClick={() => handleSelectTheme(key)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectTheme(key);
                    }
                  }}
                  className={`p-4 rounded-lg border flex flex-col justify-between gap-3 font-mono text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#58a6ff] ring-2 ring-[#58a6ff]/40 shadow-lg'
                      : 'border-[#30363d] hover:border-[#8b949e]'
                  }`}
                  style={{ backgroundColor: theme.cardBg }}
                >
                  <div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                      <span className="font-bold text-xs truncate" style={{ color: theme.title }}>
                        {theme.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/40">
                            Active
                          </span>
                        )}
                        {theme.dots.map((dot, dIdx) => (
                          <span
                            key={dIdx}
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: dot }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 mt-3">
                      <pre
                        className="text-[10px] leading-[1.15] shrink-0 select-none"
                        style={{ color: theme.ascii }}
                      >
                        {MINI_ASCII_SAMPLE.join('\n')}
                      </pre>
                      <div className="text-[11px] space-y-1 min-w-0 flex-1">
                        <div className="font-bold truncate" style={{ color: theme.title }}>
                          dev@github
                        </div>
                        <div style={{ color: theme.separator }}>----------</div>
                        <div className="truncate">
                          <span style={{ color: theme.key }}>OS:</span>{' '}
                          <span style={{ color: theme.value }}>Arch Linux</span>
                        </div>
                        <div className="truncate">
                          <span style={{ color: theme.key }}>Shell:</span>{' '}
                          <span style={{ color: theme.value }}>zsh 5.9</span>
                        </div>
                        <div className="truncate">
                          <span style={{ color: theme.key }}>Editor:</span>{' '}
                          <span style={{ color: theme.value }}>Neovim</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-[#8b949e]">
                      {isSelected ? 'Previewing in Hero' : 'Click to preview'}
                    </span>
                    <Link
                      href={`/studio?theme=${key}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#58a6ff] hover:underline font-semibold"
                    >
                      Use theme →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: How It Works / 3-Step Workflow */}
      <section id="workflow" className="py-20 px-4 sm:px-6 bg-[#0d1117] border-b border-[#30363d]">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <div className="max-w-2xl flex flex-col gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              From GitHub Username to Live README in 3 Steps
            </h2>
            <p className="text-sm sm:text-base text-[#9ca3af] leading-relaxed">
              Export standalone SVG/Markdown or embed the dynamic `/api/svg` endpoint that fetches
              your public GitHub stats automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-[#238636]/20 border border-[#3fb950]/40 text-[#3fb950] font-mono text-xs font-bold">
                  Step 1
                </span>
                <Terminal className="w-4 h-4 text-[#8b949e]" />
              </div>
              <h3 className="text-lg font-bold text-white">Auto-Import GitHub Profile</h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                Enter your GitHub handle in Studio. GitFetch pulls your public bio, repo count,
                total stars, top languages, account uptime, and converts your avatar to ASCII.
              </p>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-[#58a6ff]/15 border border-[#58a6ff]/40 text-[#58a6ff] font-mono text-xs font-bold">
                  Step 2
                </span>
                <Sliders className="w-4 h-4 text-[#8b949e]" />
              </div>
              <h3 className="text-lg font-bold text-white">Customize Fields &amp; Sobel Sliders</h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                Drag and reorder key-value rows, add section dividers, fine-tune ASCII column width
                and Sobel edge sharpness, or enable pure-CSS typewriter animations.
              </p>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-[#d2a8ff]/15 border border-[#d2a8ff]/40 text-[#d2a8ff] font-mono text-xs font-bold">
                  Step 3
                </span>
                <Code2 className="w-4 h-4 text-[#8b949e]" />
              </div>
              <h3 className="text-lg font-bold text-white">Embed Live SVG or Markdown</h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                Paste the one-line <code className="font-mono text-xs text-[#79c0ff]">&lt;img src=&quot;.../api/svg&quot;&gt;</code> tag
                into your <code className="font-mono text-xs text-[#c9d1d9]">README.md</code>, or download a standalone SVG/Markdown block.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: FAQ & Closing Conversion Banner */}
      <section id="faq" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full flex flex-col gap-16">
        <div className="flex flex-col gap-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl flex flex-col gap-2">
              <h3 className="font-bold text-base text-white">
                How do I add the terminal card to my GitHub README.md?
              </h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                Open Studio, import your GitHub username, customize your ASCII art and fields, and
                copy either the Live SVG <code className="font-mono text-xs text-[#79c0ff]">&lt;img&gt;</code> snippet or the plain
                Markdown code block directly into your profile <code className="font-mono text-xs text-[#c9d1d9]">README.md</code>.
              </p>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl flex flex-col gap-2">
              <h3 className="font-bold text-base text-white">
                Does GitFetch require GitHub login or OAuth permissions?
              </h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                No. GitFetch reads only public GitHub profile and repository metadata. You never
                need to sign in, connect an account, or grant write access.
              </p>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl flex flex-col gap-2">
              <h3 className="font-bold text-base text-white">
                Can I upload a custom image or logo instead of my GitHub avatar?
              </h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                Yes. Drop any PNG, JPG, or WebP image into the Studio ASCII panel—or pick from
                built-in vector presets like Octocat, Linux Tux, Neovim, and Cyberpunk Skull.
              </p>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl flex flex-col gap-2">
              <h3 className="font-bold text-base text-white">
                Is it open source and free to self-host?
              </h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                Yes. Built with Next.js 14, Tailwind CSS, and pure Node.js/Canvas image processing
                with zero external database dependencies—ready for one-click Vercel deployment.
              </p>
            </div>
          </div>
        </div>

        {/* Closing Conversion CTA Banner */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex flex-col gap-2 text-center lg:text-left max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ready to build your terminal README card?
            </h2>
            <p className="text-sm sm:text-base text-[#9ca3af] leading-relaxed">
              Launch the interactive Studio with the{' '}
              <span className="text-white font-semibold">{currentThemeObj.name}</span> palette
              pre-loaded and generate your card in under a minute.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            <Link
              href={`/studio?theme=${activeTheme}`}
              className="w-full sm:w-auto bg-[#238636] hover:bg-[#2ea043] text-white font-bold font-mono text-sm px-7 py-3.5 rounded-md border border-[#3fb950]/40 shadow-lg flex items-center justify-center gap-2.5 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>$ launch-studio --theme={activeTheme}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#30363d] py-6 px-4 sm:px-6 bg-[#161b22] text-xs font-mono text-[#8b949e]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#c9d1d9] font-bold">gitfetch</span>
            <span>// v1.0.0 — Terminal Profile Cards for GitHub</span>
          </div>
          <div>Inspired by neofetch &amp; Andrew6rant</div>
        </div>
      </footer>
    </div>
  );
}
