/**
 * SVG Generator for Neofetch Terminal GitHub READMEs
 * Creates dynamic, pixel-perfect SVG graphics with dark/light themes and custom color syntax.
 */

import { COLOR_THEMES } from './presets.js';

export function generateSvgCard(asciiLines, statsLines, options = {}) {
  const {
    themeKey = 'dracula',
    customTheme = null,
    fontFamily = 'Consolas, Fira Code, Monaco, "Courier New", Courier, monospace',
    padding = 24,
    gap = 4
  } = options;

  const theme = customTheme || COLOR_THEMES[themeKey] || COLOR_THEMES.dracula;

  let cleanAsciiLines = (asciiLines || []).map(l => l || '');
  if (cleanAsciiLines.length > 0) {
    let minIndent = Infinity;
    for (const line of cleanAsciiLines) {
      if (line.trim().length === 0) continue;
      const match = line.match(/^ */);
      const leading = match ? match[0].length : 0;
      if (leading < minIndent) minIndent = leading;
    }
    if (minIndent > 0 && minIndent !== Infinity) {
      cleanAsciiLines = cleanAsciiLines.map(line => line.length >= minIndent ? line.substring(minIndent) : line);
    }
  }

  const asciiWidthChars = cleanAsciiLines.reduce((max, l) => Math.max(max, (l || '').trimEnd().length), 0);
  const statsWidthChars = statsLines.reduce((max, l) => Math.max(max, (l || '').trimEnd().length), 0);
  
  const statsFontSize = 12;
  const statsCharWidth = statsFontSize * 0.57;
  const rightColWidth = statsWidthChars * statsCharWidth;

  const gapWidth = 10;
  const targetCardWidth = 800;
  const availableLeftWidth = Math.max(250, targetCardWidth - (padding * 2) - gapWidth - rightColWidth);

  let asciiFontSize = options.fontSize;
  if (!asciiFontSize || asciiFontSize <= 0) {
    if (asciiWidthChars > 0) {
      const maxFitFontSize = availableLeftWidth / (asciiWidthChars * 0.57);
      asciiFontSize = Math.min(12, Math.max(4.5, parseFloat(maxFitFontSize.toFixed(2))));
    } else {
      asciiFontSize = 11.5;
    }
  }

  const asciiLineHeight = asciiFontSize * 1.25;
  const statsLineHeight = statsFontSize * 1.35;

  const asciiCharWidth = asciiFontSize * 0.57;
  const leftColWidth = asciiWidthChars * asciiCharWidth;

  const terminalHeaderHeight = 36;
  const calculatedWidth = Math.ceil(leftColWidth + gapWidth + rightColWidth + (padding * 2));
  const contentWidth = Math.max(680, calculatedWidth);

  const asciiHeight = asciiLines.length * asciiLineHeight;
  const statsHeight = statsLines.length * statsLineHeight;
  const contentHeight = Math.max(asciiHeight, statsHeight) + (padding * 2);
  const totalHeight = Math.ceil(terminalHeaderHeight + contentHeight);

  const escapeXml = (str) => (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const animateCursor = !!(options.animateCursor || options.cursor || options.animate);
  const animateFade = !!(options.animateFade || options.fade);
  const animateTypewriter = !!(options.animateTypewriter || options.typewriter || options.animate);

  const hasLineAnim = animateTypewriter || animateFade;
  const lineAnimClass = animateTypewriter ? ' class="typewriter-line"' : (animateFade ? ' class="fade-line"' : '');

  let asciiTspans = '';
  cleanAsciiLines.forEach((line, i) => {
    const y = terminalHeaderHeight + padding + (i * asciiLineHeight) + (asciiFontSize * 0.85);
    const delayStyle = hasLineAnim ? ` style="animation-delay: ${(i * 0.04).toFixed(3)}s;"` : '';
    asciiTspans += `<tspan x="${padding}" y="${y.toFixed(1)}" fill="${theme.ascii}"${lineAnimClass}${delayStyle}>${escapeXml((line || '').trimEnd())}</tspan>\n`;
  });

  let statsTspans = '';
  const rightColX = padding + leftColWidth + gapWidth;

  statsLines.forEach((line, i) => {
    const y = terminalHeaderHeight + padding + (i * statsLineHeight) + (statsFontSize * 0.85);
    const delayStyle = hasLineAnim ? ` style="animation-delay: ${(i * 0.06 + 0.08).toFixed(3)}s;"` : '';
    
    if (/^- .+ -{5,}/.test(line)) {
      const match = line.match(/^- (.+?) (-{5,})/);
      const sectionName = match ? match[1].trim() : line;
      const dashes = match ? match[2] : '';
      statsTspans += `<tspan x="${rightColX.toFixed(1)}" y="${y.toFixed(1)}"${lineAnimClass}${delayStyle}><tspan fill="${theme.separator}">- </tspan><tspan fill="${theme.title}" font-weight="bold">${escapeXml(sectionName)} </tspan><tspan fill="${theme.separator}">${escapeXml(dashes)}</tspan></tspan>\n`;
    } else if (i === 0 && !line.includes(':')) {
      const cursorMarkup = animateCursor ? `<tspan class="blinking-cursor" fill="${theme.title}"> _</tspan>` : '';
      statsTspans += `<tspan x="${rightColX.toFixed(1)}" y="${y.toFixed(1)}"${lineAnimClass}${delayStyle}><tspan fill="${theme.title}" font-weight="bold" font-size="14px">${escapeXml(line)}</tspan>${cursorMarkup}</tspan>\n`;
    } else if (/^-{3,}$/.test(line.trim()) || /^={3,}$/.test(line.trim())) {
      statsTspans += `<tspan x="${rightColX.toFixed(1)}" y="${y.toFixed(1)}" fill="${theme.separator}"${lineAnimClass}${delayStyle}>${escapeXml(line)}</tspan>\n`;
    } else if (line.includes(':') && line.includes('..')) {
      const colonIdx = line.indexOf(':');
      const keyPart = line.substring(0, colonIdx + 1);
      const rest = line.substring(colonIdx + 1);

      const dotsMatch = rest.match(/^(\s*)(\.{2,})(\s+)(.*)/);
      statsTspans += `<tspan x="${rightColX.toFixed(1)}" y="${y.toFixed(1)}"${lineAnimClass}${delayStyle}>`;
      statsTspans += `<tspan fill="${theme.key}" font-weight="600">${escapeXml(keyPart)}</tspan>`;
      if (dotsMatch) {
        const [, preSpace, dots, postSpace, value] = dotsMatch;
        statsTspans += `<tspan fill="${theme.separator}">${escapeXml(preSpace + dots)}</tspan>`;
        statsTspans += `<tspan fill="${theme.value}">${escapeXml(postSpace + value)}</tspan>`;
      } else {
        statsTspans += `<tspan fill="${theme.value}">${escapeXml(rest)}</tspan>`;
      }
      statsTspans += `</tspan>\n`;
    } else if (line.includes(':')) {
      const colonIdx = line.indexOf(':');
      const keyPart = line.substring(0, colonIdx + 1);
      const valPart = line.substring(colonIdx + 1);
      statsTspans += `<tspan x="${rightColX.toFixed(1)}" y="${y.toFixed(1)}"${lineAnimClass}${delayStyle}><tspan fill="${theme.key}" font-weight="600">${escapeXml(keyPart)}</tspan><tspan fill="${theme.value}">${escapeXml(valPart)}</tspan></tspan>\n`;
    } else {
      statsTspans += `<tspan x="${rightColX.toFixed(1)}" y="${y.toFixed(1)}" fill="${theme.text}"${lineAnimClass}${delayStyle}>${escapeXml(line)}</tspan>\n`;
    }
  });

  const dots = (theme && theme.dots) || ["#ff5555", "#f1fa8c", "#50fa7b"];
  const headerBg = theme.bg || "#090d16";

  const isStudioPreview = !!options.isStudioPreview;
  const previewPlaying = !!options.previewPlaying;
  const shouldAnimate = !isStudioPreview || previewPlaying;

  const cursorStyles = animateCursor ? `
    @keyframes cursorBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    .blinking-cursor {
      animation: cursorBlink 0.9s step-start infinite;
      font-weight: bold;
    }
  ` : '';

  const typewriterStyles = animateTypewriter ? (shouldAnimate ? `
    @keyframes typewriterKey {
      0% { clip-path: inset(0 100% 0 0); opacity: 0; }
      1% { opacity: 1; }
      100% { clip-path: inset(0 0 0 0); opacity: 1; }
    }
    .typewriter-line {
      animation: typewriterKey 0.35s steps(28, end) forwards;
      clip-path: inset(0 100% 0 0);
      opacity: 0;
    }
  ` : `
    .typewriter-line {
      opacity: 1;
      clip-path: none;
    }
  `) : '';

  const fadeStyles = animateFade ? (shouldAnimate ? `
    @keyframes lineFadeIn {
      from { opacity: 0; transform: translateY(2px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-line {
      animation: lineFadeIn 0.35s ease-out forwards;
      opacity: 0;
    }
  ` : `
    .fade-line {
      opacity: 1;
    }
  `) : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${contentWidth} ${totalHeight}" width="${contentWidth}" height="${totalHeight}">
  <style>
    .bg { fill: ${theme.cardBg}; rx: 12px; }
    .header { fill: ${headerBg}; }
    .terminal-title { fill: ${theme.separator}; font-family: ${fontFamily}; font-size: 12px; font-weight: 500; }
    .ascii-text { font-family: ${fontFamily}; font-size: ${asciiFontSize}px; white-space: pre; }
    .stats-text { font-family: ${fontFamily}; font-size: ${statsFontSize}px; white-space: pre; }
    ${cursorStyles}
    ${typewriterStyles}
    ${fadeStyles}
  </style>

  <!-- Terminal Window Background -->
  <rect width="${contentWidth}" height="${totalHeight}" class="bg" rx="12" stroke="#333" stroke-width="1" />
  
  <!-- Terminal Header Bar -->
  <path d="M 0 12 Q 0 0 12 0 L ${contentWidth - 12} 0 Q ${contentWidth} 0 ${contentWidth} 12 L ${contentWidth} ${terminalHeaderHeight} L 0 ${terminalHeaderHeight} Z" class="header" />
  
  <!-- Window Control Buttons (Red, Yellow, Green) -->
  <circle cx="20" cy="18" r="6" fill="${dots[0]}" />
  <circle cx="38" cy="18" r="6" fill="${dots[1]}" />
  <circle cx="56" cy="18" r="6" fill="${dots[2]}" />
  
  <text x="${(contentWidth / 2).toFixed(1)}" y="22" text-anchor="middle" class="terminal-title">README.md</text>

  <!-- Code / Text Area -->
  <text class="ascii-text">
${asciiTspans}  </text>
  <text class="stats-text">
${statsTspans}  </text>
</svg>`;
}
