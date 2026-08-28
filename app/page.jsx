'use client';

import Link from 'next/link';
import { Terminal, ArrowRight, Code, ShieldCheck, Zap, Layers, Github, Copy, Check, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { COLOR_THEMES } from '@/lib/presets';
import LetterGlitch from '@/components/LetterGlitch';

export default function LandingPage() {
  const handleScrollToSection = (e, id) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#c9d1d9] font-mono selection:bg-[#238636] selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-[#30363d] bg-[#161b22]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#21262d] border border-[#30363d] text-[#58a6ff] px-2.5 py-1 rounded text-xs font-bold font-mono">
              $ gitfetch
            </div>
            <span className="text-xs text-[#8b949e] hidden sm:inline-block">v1.0.0</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs text-[#8b949e]">
            <a href="#features" onClick={(e) => handleScrollToSection(e, 'features')} className="hover:text-[#58a6ff] transition-colors">/features</a>
            <a href="#themes" onClick={(e) => handleScrollToSection(e, 'themes')} className="hover:text-[#58a6ff] transition-colors">/themes</a>
            <a href="#faq" onClick={(e) => handleScrollToSection(e, 'faq')} className="hover:text-[#58a6ff] transition-colors">/faq</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/studio"
              className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold px-4 py-2 rounded border border-[#3fb950]/30 shadow-md flex items-center gap-2 transition-all"
            >
              <span>$ launch-studio</span>
              <span className="animate-pulse">_</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center">
        {/* Background LetterGlitch Canvas */}
        <div className="absolute inset-0 z-0 opacity-35 pointer-events-none">
          <LetterGlitch
            glitchColors={['#10b981', '#06b6d4', '#238636', '#30363d']}
            glitchSpeed={100}
            centerVignette={true}
            outerVignette={true}
            smooth={false}
          />
        </div>

        <div className="max-w-6xl mx-auto w-full flex flex-col items-center text-center gap-6 relative z-10">
        {/* Live SVG API Badge Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161b22] border border-[#30363d] text-[#8b949e] text-xs">
          <Zap className="w-3.5 h-3.5 text-[#3fb950]" />
          <span className="text-[#c9d1d9]">Live SVG API & Terminal Profile Generator</span>
          <span className="bg-[#238636]/20 text-[#3fb950] text-[10px] font-bold px-2 py-0.5 rounded ml-1">v1.0</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Terminal Profile Cards For Your{' '}
          <span className="text-[#58a6ff]">GitHub README.md</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[#8b949e] text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
          Generate retro CLI system stats with smart Sobel ASCII art, custom color syntax, and a zero-dependency live SVG API endpoint.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <Link
            href="/studio"
            className="w-full sm:w-auto bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-xs px-8 py-3.5 rounded-md border border-[#3fb950]/30 shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <span>$ open-studio --create</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Terminal Live Preview Window */}
        <div className="w-full max-w-3xl mt-8 bg-[#0d1117] border border-[#30363d] rounded-xl text-left shadow-2xl overflow-hidden flex flex-col items-center">
          {/* Terminal Window Header Bar */}
          <div className="w-full bg-[#161b22] px-4 py-2.5 border-b border-[#30363d] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#f85149]" />
              <span className="w-3 h-3 rounded-full bg-[#e3b341]" />
              <span className="w-3 h-3 rounded-full bg-[#3fb950]" />
            </div>
            <span className="text-xs text-[#8b949e] font-mono">README.md</span>
            <div className="w-12" />
          </div>

          <div className="p-4 w-full flex justify-center bg-[#0d1117]">
            <img
              src="/api/svg?user=yigitardakidiman&theme=matrix&asciiWidth=75&edgeSharpen=0&contrast=1.7&config=eyJmaWVsZHMiOlt7ImtleSI6Ik9TIiwidmFsdWUiOiJXaW5kb3dzIDEwIn0seyJrZXkiOiJVcHRpbWUiLCJ2YWx1ZSI6IjEgeWVhcnMsIDcgbW9udGhzLCAxMiBkYXlzIn0seyJrZXkiOiJIb3N0IiwidmFsdWUiOiJGcmVlbGFuY2UgLyBPcGVuIFNvdXJjZSJ9LHsia2V5IjoiS2VybmVsIiwidmFsdWUiOiJqdXN0IGEgc29md3RhcmUgZW5naW5lZXJpbmcgc3R1ZGVudFxyXG4ifSx7ImtleSI6IklERSIsInZhbHVlIjoiVlNDb2RlLCBBbnRpZ3Jhdml0eSJ9LHsia2V5IjoiIiwidmFsdWUiOiIifSx7ImtleSI6Ikxhbmd1YWdlcy5Qcm9ncmFtbWluZyIsInZhbHVlIjoiUHl0aG9uLCBKYXZhU2NyaXB0LCBDIn0seyJrZXkiOiJMYW5ndWFnZXMuQ29tcHV0ZXIiLCJ2YWx1ZSI6IkhUTUwsIENTUyJ9LHsia2V5IjoiTGFuZ3VhZ2VzLlJlYWwiLCJ2YWx1ZSI6IkVuZ2xpc2gsIFR1cmtpc2gifSx7ImtleSI6IiIsInZhbHVlIjoiIn0seyJrZXkiOiJTRUNUSU9OOiBDb250YWN0IiwidmFsdWUiOiJDb250YWN0In0seyJrZXkiOiJFbWFpbCIsInZhbHVlIjoieWlnaXRhcmRha2lkaW1hbkBnbWFpbC5jb20ifSx7ImtleSI6IldlYnNpdGUiLCJ2YWx1ZSI6Imh0dHBzOi8vd3d3LmtpZGltYW4uY29tLyJ9LHsia2V5IjoiTGlua2VkSW4iLCJ2YWx1ZSI6Ii9pbi95aWdpdGFyZGFraWRpbWFuIn0seyJrZXkiOiJJbnN0YWdyYW0iLCJ2YWx1ZSI6IkBjb2Rld2l0aGtpZGltYW4ifSx7ImtleSI6IkxvY2F0aW9uIiwidmFsdWUiOiJFYXJ0aCJ9LHsia2V5IjoiIiwidmFsdWUiOiIifSx7ImtleSI6IlNFQ1RJT046IEdpdEh1YiBTdGF0cyIsInZhbHVlIjoiR2l0SHViIFN0YXRzIn0seyJrZXkiOiJSZXBvcyIsInZhbHVlIjoiMTQgfCBTdGFyczogMSJ9LHsia2V5IjoiRm9sbG93ZXJzIiwidmFsdWUiOiI8ICB8IEZvbGxvd2luZzogNiJ9XSwiaGVhZGVyVGl0bGUiOiJ5aWdpdGFyZGFraWRpbWFuQGdpdGh1YiIsImhlYWRlclNlcGFyYXRvciI6Ii0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIiwiY3VzdG9tVGhlbWUiOm51bGx9"
              alt="GitFetch Terminal"
              className="max-w-[680px] w-full h-auto rounded-lg shadow-xl"
            />
          </div>
        </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-16 px-6 bg-[#161b22]/60 border-t border-[#30363d]">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="flex items-center gap-2 text-xs text-[#58a6ff] uppercase tracking-wider font-bold">
            <ChevronRight className="w-4 h-4" /> // CORE_MODULES
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0d1117] border border-[#30363d] p-5 rounded-md flex flex-col gap-3">
              <div className="text-xs font-bold text-[#3fb950] font-mono">01. SOBEL_ASCII_ENGINE</div>
              <h3 className="font-bold text-sm text-white">Smart Image Processor</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Sobel edge extraction, histogram normalization, background noise cleaning, and Floyd-Steinberg dithering.
              </p>
            </div>

            <div className="bg-[#0d1117] border border-[#30363d] p-5 rounded-md flex flex-col gap-3">
              <div className="text-xs font-bold text-[#58a6ff] font-mono">02. LIVE_SVG_API</div>
              <h3 className="font-bold text-sm text-white">Dynamic SVG URL Endpoint</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Embed direct <code className="bg-[#161b22] text-[#79c0ff] px-1 py-0.5 rounded">/api/svg?user=xxx</code> URLs in your README. Zero manual SVG downloads needed.
              </p>
            </div>

            <div className="bg-[#0d1117] border border-[#30363d] p-5 rounded-md flex flex-col gap-3">
              <div className="text-xs font-bold text-[#d2a8ff] font-mono">03. REORDER_FIELD_GRID</div>
              <h3 className="font-bold text-sm text-white">Drag & Drop Editor</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Reorder stats fields, insert section headers, blank line gaps, and tech stack badges with drag & drop precision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Themes Section */}
      <section id="themes" className="py-16 px-6 bg-[#161b22]/40 border-t border-[#30363d]">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          <div className="flex items-center gap-2 text-xs text-[#58a6ff] uppercase tracking-wider font-bold">
            <ChevronRight className="w-4 h-4" /> // COLOR_THEMES
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(COLOR_THEMES).slice(0, 4).map(([key, theme]) => (
              <div
                key={key}
                className="p-4 rounded border border-[#30363d] flex flex-col gap-2 font-mono text-xs"
                style={{ backgroundColor: theme.cardBg }}
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="font-bold text-xs" style={{ color: theme.title }}>{theme.name}</span>
                  <div className="flex gap-1">
                    {theme.dots.map((dot, dIdx) => (
                      <span key={dIdx} className="w-2 h-2 rounded-full" style={{ backgroundColor: dot }} />
                    ))}
                  </div>
                </div>
                <div className="text-[11px] space-y-1 mt-1">
                  <div><span style={{ color: theme.key }}>OS:</span> <span style={{ color: theme.value }}>Linux</span></div>
                  <div><span style={{ color: theme.key }}>Shell:</span> <span style={{ color: theme.value }}>zsh</span></div>
                  <div style={{ color: theme.ascii }}>@terminal_output</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-6 max-w-5xl mx-auto w-full">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2 text-xs text-[#58a6ff] uppercase tracking-wider font-bold">
            <ChevronRight className="w-4 h-4" /> // FREQUENTLY_ASKED_QUESTIONS
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-md flex flex-col gap-2">
              <h3 className="font-bold text-white">$ how_to_use_in_github?</h3>
              <p className="text-[#8b949e] leading-relaxed">Launch Studio, import your GitHub profile, customize your ASCII art & stats, then copy the Markdown code block or embed the Live SVG API tag directly into your README.md.</p>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-md flex flex-col gap-2">
              <h3 className="font-bold text-white">$ is_it_open_source?</h3>
              <p className="text-[#8b949e] leading-relaxed">Yes. Built with Next.js 14, Tailwind CSS, and standard Web APIs. Free to use and deploy on Vercel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#30363d] py-6 px-6 bg-[#161b22] text-center text-xs text-[#8b949e]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>neofetch-readme-generator // v1.0.0</div>
          <div>Inspired by Andrew6rant/Andrew6rant</div>
        </div>
      </footer>
    </div>
  );
}
