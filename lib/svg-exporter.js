/**
 * SVG Generator for Neofetch Terminal GitHub READMEs
 * Creates dynamic, pixel-perfect SVG graphics with dark/light themes and custom color syntax.
 */

import { COLOR_THEMES } from './presets.js';

export function generateSvgCard(asciiLines, statsLines, options = {}) {
  const {
    themeKey = 'dracula',
    customTheme = null,
    fontFamily = 'Consolas, "Fira Code", Monaco, "Courier New", Courier, monospace',
    padding = 24
  } = options;

  const theme = customTheme || COLOR_THEMES[themeKey] || COLOR_THEMES.dracula;

  let cleanAsciiLines = (asciiLines || []).map((l) => l || '');
  if (cleanAsciiLines.length > 0) {
    let minIndent = Infinity;
    for (const line of cleanAsciiLines) {
      if (line.trim().length === 0) continue;
      const match = line.match(/^ */);
      const leading = match ? match[0].length : 0;
      if (leading < minIndent) minIndent = leading;
    }
    if (minIndent > 0 && minIndent !== Infinity) {
      cleanAsciiLines = cleanAsciiLines.map((line) =>
        line.length >= minIndent ? line.substring(minIndent) : line
      );
    }
  }

  const asciiWidthChars = cleanAsciiLines.reduce(
    (max, l) => Math.max(max, (l || '').trimEnd().length),
    0
  );
  const statsWidthChars = statsLines.reduce(
    (max, l) => Math.max(max, (l || '').trimEnd().length),
    0
  );

  const statsFontSize = 12;
  const statsCharWidth = statsFontSize * 0.6;
  const rightColWidth = statsWidthChars * statsCharWidth;

  const gapWidth = 20;
  const targetCardWidth = 800;
  const availableLeftWidth = Math.max(
    250,
    targetCardWidth - padding * 2 - gapWidth - rightColWidth
  );

  let asciiFontSize = options.fontSize;
  if (!asciiFontSize || asciiFontSize <= 0) {
    if (asciiWidthChars > 0) {
      const maxFitFontSize = availableLeftWidth / (asciiWidthChars * 0.6);
      asciiFontSize = Math.min(12, Math.max(4.5, parseFloat(maxFitFontSize.toFixed(2))));
    } else {
      asciiFontSize = 11.5;
    }
  }

  const asciiLineHeight = asciiFontSize * 1.22;
  const statsLineHeight = statsFontSize * 1.35;

  const asciiCharWidth = asciiFontSize * 0.6;
  const leftColWidth = asciiWidthChars * asciiCharWidth;

  const terminalHeaderHeight = 36;
  const calculatedWidth = Math.ceil(leftColWidth + gapWidth + rightColWidth + padding * 2);
  const contentWidth = Math.max(680, calculatedWidth);

  const asciiHeight = cleanAsciiLines.length * asciiLineHeight;
  const statsHeight = statsLines.length * statsLineHeight;
  const contentHeight = Math.max(asciiHeight, statsHeight) + padding * 2;
  const totalHeight = Math.ceil(terminalHeaderHeight + contentHeight);

  // Preserve exact monospace whitespace in all SVG / HTML parsers by converting spaces to &#160;
  const escapeXmlPreserveSpaces = (str) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/ /g, '&#160;');

  const animateCursor = !!(options.animateCursor || options.cursor || options.animate);
  const animateFade = !!(options.animateFade || options.fade);
  const animateTypewriter = !!(options.animateTypewriter || options.typewriter || options.animate);

  const isStudioPreview = !!options.isStudioPreview;
  const previewPlaying = !!options.previewPlaying;
  const shouldAnimate = !isStudioPreview || previewPlaying;

  const hasLineAnim = (animateTypewriter || animateFade) && shouldAnimate;
  const asciiAnimClass = hasLineAnim ? ' class="ascii-line-anim"' : '';
  const statsFadeClass = hasLineAnim && animateFade && !animateTypewriter ? ' class="fade-line"' : '';

  // Normalize stagger step so high-resolution ASCII (80+ rows) completes smoothly in ~0.9s
  const asciiStep = Math.min(0.016, 0.75 / Math.max(1, cleanAsciiLines.length));
  const statsStep = Math.min(0.045, 1.05 / Math.max(1, statsLines.length));

  let asciiNodes = '';
  cleanAsciiLines.forEach((line, i) => {
    const trimmedRight = (line || '').trimEnd();
    if (!trimmedRight) return;
    const y = terminalHeaderHeight + padding + i * asciiLineHeight + asciiFontSize * 0.85;
    const delayStyle = hasLineAnim ? ` style="animation-delay: ${(i * asciiStep).toFixed(3)}s;"` : '';
    asciiNodes += `    <text x="${padding}" y="${y.toFixed(1)}" xml:space="preserve"${asciiAnimClass}${delayStyle}>${escapeXmlPreserveSpaces(trimmedRight)}</text>\n`;
  });

  let statsNodes = '';
  let typewriterMaskNodes = '';
  const rightColX = padding + leftColWidth + gapWidth;

  statsLines.forEach((line, i) => {
    const rawLine = (line || '').trimEnd();
    if (!rawLine) return;

    const lineTopY = terminalHeaderHeight + padding + i * statsLineHeight;
    const y = lineTopY + statsFontSize * 0.85;
    const delaySec = (i * statsStep + 0.05).toFixed(3);
    const fadeDelayStyle = statsFadeClass ? ` style="animation-delay: ${delaySec}s;"` : '';

    // If Typewriter animation is active, we render the text statically (zero glyph re-rasterization!)
    // and reveal it using a GPU-composited <rect> wipe over the exact width of the line.
    if (hasLineAnim && animateTypewriter) {
      const maskWidth = Math.ceil(Math.max(40, rawLine.length * statsCharWidth + 24));
      const maskHeight = Math.ceil(statsLineHeight + 2);
      const lineSteps = Math.min(28, Math.max(8, rawLine.length));
      typewriterMaskNodes += `    <rect x="${rightColX.toFixed(1)}" y="${(lineTopY - 1).toFixed(1)}" width="${maskWidth}" height="${maskHeight}" fill="${theme.cardBg}" class="tw-mask" style="animation-delay: ${delaySec}s; animation-timing-function: steps(${lineSteps}, end);" />\n`;
    }

    if (/^- .+ -{5,}/.test(rawLine)) {
      const match = rawLine.match(/^- (.+?) (-{5,})/);
      const sectionName = match ? match[1].trim() : rawLine;
      const dashes = match ? match[2] : '';
      statsNodes += `    <text x="${rightColX.toFixed(1)}" y="${y.toFixed(1)}" xml:space="preserve"${statsFadeClass}${fadeDelayStyle}><tspan fill="${theme.separator}">-&#160;</tspan><tspan fill="${theme.title}" font-weight="bold">${escapeXmlPreserveSpaces(sectionName)}&#160;</tspan><tspan fill="${theme.separator}">${escapeXmlPreserveSpaces(dashes)}</tspan></text>\n`;
    } else if (i === 0 && !rawLine.includes(':')) {
      const cursorMarkup = animateCursor
        ? `<tspan class="blinking-cursor" fill="${theme.title}">&#160;_</tspan>`
        : '';
      statsNodes += `    <text x="${rightColX.toFixed(1)}" y="${y.toFixed(1)}" xml:space="preserve"${statsFadeClass}${fadeDelayStyle}><tspan fill="${theme.title}" font-weight="bold" font-size="14px">${escapeXmlPreserveSpaces(rawLine)}</tspan>${cursorMarkup}</text>\n`;
    } else if (/^-{3,}$/.test(rawLine.trim()) || /^={3,}$/.test(rawLine.trim())) {
      statsNodes += `    <text x="${rightColX.toFixed(1)}" y="${y.toFixed(1)}" fill="${theme.separator}" xml:space="preserve"${statsFadeClass}${fadeDelayStyle}>${escapeXmlPreserveSpaces(rawLine)}</text>\n`;
    } else if (rawLine.includes(':') && rawLine.includes('..')) {
      const colonIdx = rawLine.indexOf(':');
      const keyPart = rawLine.substring(0, colonIdx + 1);
      const rest = rawLine.substring(colonIdx + 1);

      const dotsMatch = rest.match(/^(\s*)(\.{2,})(\s+)(.*)/);
      statsNodes += `    <text x="${rightColX.toFixed(1)}" y="${y.toFixed(1)}" xml:space="preserve"${statsFadeClass}${fadeDelayStyle}>`;
      statsNodes += `<tspan fill="${theme.key}" font-weight="600">${escapeXmlPreserveSpaces(keyPart)}</tspan>`;
      if (dotsMatch) {
        const [, preSpace, dots, postSpace, value] = dotsMatch;
        statsNodes += `<tspan fill="${theme.separator}">${escapeXmlPreserveSpaces(preSpace + dots)}</tspan>`;
        statsNodes += `<tspan fill="${theme.value}">${escapeXmlPreserveSpaces(postSpace + value)}</tspan>`;
      } else {
        statsNodes += `<tspan fill="${theme.value}">${escapeXmlPreserveSpaces(rest)}</tspan>`;
      }
      statsNodes += `</text>\n`;
    } else if (rawLine.includes(':')) {
      const colonIdx = rawLine.indexOf(':');
      const keyPart = rawLine.substring(0, colonIdx + 1);
      const valPart = rawLine.substring(colonIdx + 1);
      statsNodes += `    <text x="${rightColX.toFixed(1)}" y="${y.toFixed(1)}" xml:space="preserve"${statsFadeClass}${fadeDelayStyle}><tspan fill="${theme.key}" font-weight="600">${escapeXmlPreserveSpaces(keyPart)}</tspan><tspan fill="${theme.value}">${escapeXmlPreserveSpaces(valPart)}</tspan></text>\n`;
    } else {
      statsNodes += `    <text x="${rightColX.toFixed(1)}" y="${y.toFixed(1)}" fill="${theme.text}" xml:space="preserve"${statsFadeClass}${fadeDelayStyle}>${escapeXmlPreserveSpaces(rawLine)}</text>\n`;
    }
  });

  const dots = (theme && theme.dots) || ['#ff5555', '#f1fa8c', '#50fa7b'];
  const headerBg = theme.bg || '#090d16';

  const cursorStyles = animateCursor
    ? `
    @keyframes cursorBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    .blinking-cursor {
      animation: cursorBlink 0.9s step-start infinite;
      font-weight: bold;
    }
  `
    : '';

  const lineAnimStyles = hasLineAnim
    ? `
    @keyframes asciiLineReveal {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .ascii-line-anim {
      opacity: 0;
      animation: asciiLineReveal 0.16s ease-out forwards;
    }
    ${
      animateTypewriter
        ? `
    @keyframes typewriterWipe {
      0% { transform: scaleX(1); }
      100% { transform: scaleX(0); }
    }
    .tw-mask {
      transform-box: fill-box;
      transform-origin: right center;
      animation-name: typewriterWipe;
      animation-duration: 0.28s;
      animation-fill-mode: forwards;
      will-change: transform;
    }
    `
        : `
    @keyframes lineFadeIn {
      from { opacity: 0; transform: translateY(3px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-line {
      opacity: 0;
      animation: lineFadeIn 0.24s ease-out forwards;
    }
    `
    }
  `
    : '';

  const studioSizeStyle = isStudioPreview
    ? ` style="width: 100%; height: 100%; max-width: ${contentWidth}px; max-height: ${totalHeight}px;"`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${contentWidth} ${totalHeight}" width="${contentWidth}" height="${totalHeight}" preserveAspectRatio="xMidYMid meet"${studioSizeStyle} xml:space="preserve">
  <style>
    .bg { fill: ${theme.cardBg}; rx: 12px; }
    .header { fill: ${headerBg}; }
    .terminal-title { fill: ${theme.separator}; font-family: ${fontFamily}; font-size: 12px; font-weight: 500; }
    .ascii-group, .ascii-group text { font-family: ${fontFamily}; font-size: ${asciiFontSize}px; fill: ${theme.ascii}; white-space: pre; }
    .stats-group, .stats-group text { font-family: ${fontFamily}; font-size: ${statsFontSize}px; white-space: pre; }
    ${cursorStyles}
    ${lineAnimStyles}
  </style>

  <!-- Terminal Window Background -->
  <rect width="${contentWidth}" height="${totalHeight}" class="bg" rx="12" stroke="#30363d" stroke-width="1" />
  
  <!-- Terminal Header Bar -->
  <path d="M 0 12 Q 0 0 12 0 L ${contentWidth - 12} 0 Q ${contentWidth} 0 ${contentWidth} 12 L ${contentWidth} ${terminalHeaderHeight} L 0 ${terminalHeaderHeight} Z" class="header" />
  
  <!-- Window Control Buttons (Red, Yellow, Green) -->
  <circle cx="20" cy="18" r="6" fill="${dots[0]}" />
  <circle cx="38" cy="18" r="6" fill="${dots[1]}" />
  <circle cx="56" cy="18" r="6" fill="${dots[2]}" />
  
  <text x="${(contentWidth / 2).toFixed(1)}" y="22" text-anchor="middle" class="terminal-title">README.md</text>

  <!-- Code / Text Area -->
  <g class="ascii-group">
${asciiNodes}  </g>
  <g class="stats-group">
${statsNodes}  </g>
${typewriterMaskNodes ? `  <!-- GPU Typewriter Reveal Masks -->\n  <g>\n${typewriterMaskNodes}  </g>\n` : ''}</svg>`;
}
