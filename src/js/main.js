/**
 * Terminal Neofetch README Generator Main Application Entry
 */

import { imageToAscii, getDefaultAsciiAvatar } from './ascii-engine.js';
import { fetchGitHubUser } from './github-api.js';
import { PRESETS, COLOR_THEMES } from './presets.js';
import { buildStatsLines, mergeSideBySide, buildMarkdownCodeBlock, buildHtmlPreBlock } from './neofetch-builder.js';
import { generateSvgCard } from './svg-exporter.js';

// App State
const state = {
  activeTab: 'terminal', // 'terminal' | 'markdown' | 'svg'
  asciiLines: [],
  currentImgElement: null,
  headerTitle: "username@hostname",
  headerSeparator: "-------------------",
  themeKey: "dracula",
  asciiWidth: 38,
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
    { key: "Uptime", value: "4 years, 7 months, 12 days" },
    { key: "Host", value: "Your Company, Inc." },
    { key: "Kernel", value: "Full-Stack Developer" },
    { key: "IDE", value: "VSCode 1.96.0, WebStorm 2024.3" },
    { key: "", value: "" },
    { key: "Languages.Programming", value: "TypeScript, Python, Rust, Go" },
    { key: "Languages.Computer", value: "HTML, CSS, JSON, YAML, SQL" },
    { key: "Languages.Real", value: "English, Turkish" },
    { key: "", value: "" },
    { key: "Hobbies.Software", value: "Open Source, Game Dev, AI/ML" },
    { key: "Hobbies.Hardware", value: "Custom Keyboards, 3D Printing" },
    { key: "", value: "" },
    { key: "SECTION: Contact", value: "Contact" },
    { key: "Email.Personal", value: "your-email@gmail.com" },
    { key: "Email.Work", value: "you@your-company.com" },
    { key: "Website", value: "https://your-website.dev" },
    { key: "LinkedIn", value: "your-linkedin" },
    { key: "Twitter/X", value: "@your-handle" },
    { key: "Discord", value: "your-discord" },
    { key: "", value: "" },
    { key: "SECTION: GitHub Stats", value: "GitHub Stats" },
    { key: "Repos", value: "42 {Contributed: 78} | Stars: 156" },
    { key: "Commits", value: "1,284 | Followers: 89" },
    { key: "Lines of Code on GitHub", value: "215,430 (287,600++, 72,170--)" }
  ]
};

// DOM Elements
const ghUsernameInput = document.getElementById('ghUsernameInput');
const ghImportBtn = document.getElementById('ghImportBtn');
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const imageUrlInput = document.getElementById('imageUrlInput');
const asciiWidthSlider = document.getElementById('asciiWidthSlider');
const asciiWidthVal = document.getElementById('asciiWidthVal');
const charSetSelect = document.getElementById('charSetSelect');
const contrastSlider = document.getElementById('contrastSlider');
const contrastVal = document.getElementById('contrastVal');
const invertCheck = document.getElementById('invertCheck');
const headerTitleInput = document.getElementById('headerTitleInput');
const headerSepInput = document.getElementById('headerSepInput');
const fieldsContainer = document.getElementById('fieldsContainer');
const addFieldBtn = document.getElementById('addFieldBtn');
const themeSelect = document.getElementById('themeSelect');
const presetSelect = document.getElementById('presetSelect');
const previewContainer = document.getElementById('previewContainer');
const tabButtons = document.querySelectorAll('.tab-btn');
const copyMarkdownBtn = document.getElementById('copyMarkdownBtn');
const quickCopyBtn = document.getElementById('quickCopyBtn');
const downloadSvgBtn = document.getElementById('downloadSvgBtn');
const toastContainer = document.getElementById('toastContainer');
const avatarThumbnail = document.getElementById('avatarThumbnail');

// Initialize
async function init() {
  state.asciiLines = getDefaultAsciiAvatar();
  renderFieldsEditor();
  setupEventListeners();
  await updateAsciiAndRender();
}

// Render Field Rows in Left Sidebar with Drag & Drop & Reordering
function renderFieldsEditor() {
  fieldsContainer.innerHTML = '';
  state.fields.forEach((field, index) => {
    const row = document.createElement('div');
    row.className = 'field-editor-row';
    row.draggable = true;
    row.dataset.index = index;
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '0.35rem';
    row.style.padding = '0.3rem 0.4rem';
    row.style.background = 'rgba(255, 255, 255, 0.03)';
    row.style.border = '1px solid rgba(255, 255, 255, 0.07)';
    row.style.borderRadius = '6px';
    row.style.transition = 'all 0.15s ease';
    row.style.marginBottom = '0.35rem';

    const dragHandleHtml = `<span class="drag-handle" title="Tut ve sürükle (Drag to reorder)" style="cursor:grab; padding:0 0.2rem; color:var(--text-muted); font-size:1.1rem; user-select:none;">⠿</span>`;
    const moveButtonsHtml = `
      <button class="btn btn-secondary btn-sm" data-move-up="${index}" title="Yukarı Taşı" style="padding:0.2rem 0.4rem; font-size:0.75rem;" ${index === 0 ? 'disabled' : ''}>▲</button>
      <button class="btn btn-secondary btn-sm" data-move-down="${index}" title="Aşağı Taşı" style="padding:0.2rem 0.4rem; font-size:0.75rem;" ${index === state.fields.length - 1 ? 'disabled' : ''}>▼</button>
      <button class="btn btn-danger btn-sm" data-delete="${index}" title="Sil" style="padding:0.2rem 0.5rem;">✕</button>
    `;

    if (field.key && (field.key.startsWith('SECTION:') || field.key.startsWith('---'))) {
      // Section Header Row
      const titleVal = field.value || field.key.replace(/^SECTION:|^---/, '').replace(/---$/, '').trim();
      row.innerHTML = `
        ${dragHandleHtml}
        <span style="font-size:0.65rem; font-weight:700; color:var(--accent-secondary); background:rgba(6,182,212,0.15); padding:0.2rem 0.4rem; border-radius:4px; white-space:nowrap;">HEADER</span>
        <input type="text" placeholder="Section Title (e.g. Contact)" value="${escapeAttr(titleVal)}" data-index="${index}" data-type="header" style="flex:1; font-weight:600; color:var(--accent-secondary);">
        ${moveButtonsHtml}
      `;
    } else if (!field.key && !field.value) {
      // Blank Line Separator Row
      row.innerHTML = `
        ${dragHandleHtml}
        <span style="font-size:0.7rem; color:var(--text-muted); background:rgba(255,255,255,0.05); padding:0.2rem 0.4rem; border-radius:4px; flex:1; text-align:center;">--- Blank Line Space ---</span>
        ${moveButtonsHtml}
      `;
    } else {
      // Key: Value Row
      row.innerHTML = `
        ${dragHandleHtml}
        <input type="text" placeholder="Key (e.g. OS)" value="${escapeAttr(field.key)}" data-index="${index}" data-type="key" style="flex:1;">
        <span style="color:var(--text-muted); font-weight:bold;">:</span>
        <input type="text" placeholder="Value (e.g. Linux)" value="${escapeAttr(field.value)}" data-index="${index}" data-type="value" style="flex:1.5;">
        ${moveButtonsHtml}
      `;
    }

    // Drag & Drop Events
    row.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', index.toString());
      e.dataTransfer.effectAllowed = 'move';
      row.style.opacity = '0.4';
      row.style.borderColor = 'var(--accent-primary)';
    });

    row.addEventListener('dragend', () => {
      row.style.opacity = '1';
      row.style.borderColor = 'rgba(255, 255, 255, 0.07)';
      document.querySelectorAll('.field-editor-row').forEach(r => {
        r.style.borderTop = '1px solid rgba(255, 255, 255, 0.07)';
        r.style.borderBottom = '1px solid rgba(255, 255, 255, 0.07)';
      });
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      row.style.borderTop = '2px solid var(--accent-primary)';
    });

    row.addEventListener('dragleave', () => {
      row.style.borderTop = '1px solid rgba(255, 255, 255, 0.07)';
    });

    row.addEventListener('drop', (e) => {
      e.preventDefault();
      row.style.borderTop = '1px solid rgba(255, 255, 255, 0.07)';
      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
      const toIdx = index;

      if (!isNaN(fromIdx) && fromIdx !== toIdx) {
        const movedItem = state.fields.splice(fromIdx, 1)[0];
        state.fields.splice(toIdx, 0, movedItem);
        renderFieldsEditor();
        renderPreview();
      }
    });

    fieldsContainer.appendChild(row);
  });
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;');
}

// Update ASCII Art from current Image Element or Fallback
async function updateAsciiAndRender() {
  if (state.currentImgElement) {
    try {
      state.asciiLines = await imageToAscii(state.currentImgElement, {
        width: state.asciiWidth,
        charSetKey: state.charSetKey,
        contrast: state.contrast,
        invert: state.invert,
        autoEnhance: state.autoEnhance,
        edgeSharpen: state.edgeSharpen,
        bgThreshold: state.bgThreshold,
        dither: state.dither
      });
    } catch (e) {
      console.warn("ASCII conversion error, using fallback:", e);
      state.asciiLines = getDefaultAsciiAvatar();
    }
  }

  renderPreview();
}

// Render Right Preview Panel based on Active Tab
function renderPreview() {
  const statsLines = buildStatsLines(
    state.headerTitle,
    state.headerSeparator,
    [{ name: "", fields: state.fields }]
  );

  const mergedLines = mergeSideBySide(state.asciiLines, statsLines);
  const theme = COLOR_THEMES[state.themeKey] || COLOR_THEMES.dracula;

  if (state.activeTab === 'terminal') {
    renderTerminalVisual(state.asciiLines, statsLines, theme);
  } else if (state.activeTab === 'markdown') {
    const mdCode = buildMarkdownCodeBlock(mergedLines);
    const htmlPreCode = buildHtmlPreBlock(mergedLines, state.customFontSize > 0 ? state.customFontSize : 10);

    previewContainer.innerHTML = `
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
        <button id="copyMdBlockBtn" class="btn btn-primary btn-sm">📋 Copy \`\`\`text Markdown Block</button>
        <button id="copyHtmlPreBtn" class="btn btn-secondary btn-sm">📋 Copy HTML &lt;pre&gt; Block (Font Size Fitted)</button>
      </div>

      <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 1rem; text-align: left;">
        <div style="font-size: 0.75rem; color: #8b949e; margin-bottom: 0.5rem; font-family: sans-serif; font-weight: 600;">GitHub README.md Rendering Simulation:</div>
        <pre style="color: #c9d1d9; font-size: ${state.customFontSize > 0 ? state.customFontSize + 'px' : '11.5px'}; font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace; line-height: 1.25; overflow-x: auto; margin: 0; background: transparent; padding: 0;">${escapeHtml(mdCode)}</pre>
      </div>
    `;

    document.getElementById('copyMdBlockBtn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(mdCode);
      showToast('Markdown ```text block copied to clipboard!');
    });

    document.getElementById('copyHtmlPreBtn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(htmlPreCode);
      showToast('HTML <pre> block (with fitted font-size) copied!');
    });
  } else if (state.activeTab === 'svg') {
    const svgCode = generateSvgCard(state.asciiLines, statsLines, {
      themeKey: state.themeKey,
      fontSize: state.customFontSize > 0 ? state.customFontSize : undefined
    });
    previewContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 1rem;">
        <button id="copySvgCodeBtn" class="btn btn-secondary btn-sm">📋 Copy Raw SVG XML</button>
      </div>
      <div style="display:flex; justify-content:center;">
        ${svgCode}
      </div>
    `;
    document.getElementById('copySvgCodeBtn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(svgCode);
      showToast('SVG XML copied to clipboard!');
    });
  }
}

// Render Rich Colorized Terminal Preview
function renderTerminalVisual(asciiLines, statsLines, theme) {
  // Use trimEnd to measure real visible width instead of trailing space padding
  const asciiColWidth = asciiLines.reduce((max, l) => Math.max(max, (l || '').trimEnd().length), 0);

  // Dynamic font size ONLY for ASCII Art column
  let asciiFontSize = state.customFontSize > 0 ? state.customFontSize : 13;
  if (state.customFontSize <= 0) {
    if (asciiColWidth > 100) asciiFontSize = 5.8;
    else if (asciiColWidth > 75) asciiFontSize = 7.5;
    else if (asciiColWidth > 55) asciiFontSize = 9.5;
  }

  const statsFontSize = 13; // Always readable 13px for right-hand stats!

  let html = `<div style="display: flex; gap: 0.6rem; align-items: flex-start; color: ${theme.text};">`;

  // Left ASCII Art Column
  html += `<div style="color: ${theme.ascii}; font-family: var(--font-mono); font-size: ${asciiFontSize}px; line-height: 1.2; flex-shrink: 0; white-space: pre;">`;
  for (let i = 0; i < asciiLines.length; i++) {
    html += `${escapeHtml((asciiLines[i] || '').trimEnd())}\n`;
  }
  html += `</div>`;

  // Right Stats Column (Always 13px readable text!)
  html += `<div style="flex-grow: 1; font-family: var(--font-mono); font-size: ${statsFontSize}px; line-height: 1.25; white-space: pre;">`;
  for (let i = 0; i < statsLines.length; i++) {
    const line = statsLines[i] || '';

    // Section header: "- Contact --------"
    if (/^- .+ -{5,}/.test(line)) {
      const match = line.match(/^- (.+?) -{5,}/);
      const sectionName = match ? match[1].trim() : line;
      html += `<div style="color: ${theme.title}; font-weight: 700; font-size: 13px;"><span style="color: ${theme.separator};">- </span>${escapeHtml(sectionName)} <span style="color: ${theme.separator};">${escapeHtml('-'.repeat(Math.max(5, 42 - sectionName.length)))}</span></div>`;
    } else if (i === 0 && !line.includes(':')) {
      // Title line
      html += `<div style="color: ${theme.title}; font-weight: 700; font-size: 14px;">${escapeHtml(line)}</div>`;
    } else if (/^-{3,}$/.test(line.trim()) || /^={3,}$/.test(line.trim())) {
      // Pure separator line
      html += `<div style="color: ${theme.separator};">${escapeHtml(line)}</div>`;
    } else if (line.includes(':') && line.includes('..')) {
      // Key: .... Value (dot-aligned)
      const colonIdx = line.indexOf(':');
      const keyPart = line.substring(0, colonIdx + 1);
      const rest = line.substring(colonIdx + 1);

      // Find the dots section: space + dots + space
      const dotsMatch = rest.match(/^(\s*)(\.{2,})(\s+)(.*)/);
      if (dotsMatch) {
        const [, preSpace, dots, postSpace, value] = dotsMatch;
        html += `<div><span style="color: ${theme.key}; font-weight: 600;">${escapeHtml(keyPart)}</span><span style="color: ${theme.separator};">${escapeHtml(preSpace + dots)}</span><span style="color: ${theme.value};">${escapeHtml(postSpace + value)}</span></div>`;
      } else {
        html += `<div><span style="color: ${theme.key}; font-weight: 600;">${escapeHtml(keyPart)}</span><span style="color: ${theme.value};">${escapeHtml(rest)}</span></div>`;
      }
    } else if (line.includes(':')) {
      // Key: Value (no dots)
      const colonIdx = line.indexOf(':');
      const keyPart = line.substring(0, colonIdx + 1);
      const valPart = line.substring(colonIdx + 1);
      html += `<div><span style="color: ${theme.key}; font-weight: 600;">${escapeHtml(keyPart)}</span><span style="color: ${theme.value};">${escapeHtml(valPart)}</span></div>`;
    } else if (line.trim() === '') {
      html += `<div>&nbsp;</div>`;
    } else {
      html += `<div style="color: ${theme.text};">${escapeHtml(line)}</div>`;
    }
  }
  html += `</div></div>`;

  previewContainer.innerHTML = html;
  previewContainer.style.background = theme.cardBg;
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Toast System
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Bulletproof CORS-safe Image Loader
async function loadImageSource(src) {
  try {
    let finalSrc = src;

    // If external URL (http/https), try fetching as Blob to prevent Canvas CORS Tainting
    if (src.startsWith('http://') || src.startsWith('https://')) {
      try {
        const res = await fetch(src, { mode: 'cors' });
        if (res.ok) {
          const blob = await res.blob();
          finalSrc = URL.createObjectURL(blob);
        }
      } catch (corsErr) {
        console.warn('Direct CORS fetch failed, trying CORS proxy fallback:', corsErr);
        // CORS Proxy fallback for restricted external images
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(src)}`;
        try {
          const proxyRes = await fetch(proxyUrl);
          if (proxyRes.ok) {
            const proxyBlob = await proxyRes.blob();
            finalSrc = URL.createObjectURL(proxyBlob);
          }
        } catch (e) {
          console.warn('Proxy load failed, falling back to direct img element:', e);
        }
      }
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        showToast('Image has invalid dimensions.');
        return;
      }
      state.currentImgElement = img;
      avatarThumbnail.src = finalSrc;
      avatarThumbnail.style.display = 'block';
      updateAsciiAndRender();
      showToast('Görsel başarıyla yüklendi!');
    };

    img.onerror = () => {
      // Retry without crossOrigin attribute if failed
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        state.currentImgElement = fallbackImg;
        avatarThumbnail.src = finalSrc;
        avatarThumbnail.style.display = 'block';
        updateAsciiAndRender();
        showToast('Görsel yüklendi!');
      };
      fallbackImg.onerror = () => {
        showToast('Görsel yüklenemedi. Geçerli bir resim adresi girin.');
      };
      fallbackImg.src = finalSrc;
    };

    img.src = finalSrc;
  } catch (err) {
    showToast('Görsel yüklenirken hata oluştu.');
  }
}

// Event Listeners Setup
function setupEventListeners() {
  // Collapsible Accordion Section Boxes
  document.querySelectorAll('.collapsible-title').forEach(title => {
    title.addEventListener('click', () => {
      const box = title.closest('.section-box');
      if (box) {
        box.classList.toggle('collapsed');
      }
    });
  });

  // Tab Switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.activeTab = e.target.dataset.tab;
      renderPreview();
    });
  });

  // Sliders & Controls
  // Resolution Presets (Standard, HD, Ultra-HD, README.md Optimal)
  const resMarkdownOptBtn = document.getElementById('resMarkdownOptBtn');
  const resNormalBtn = document.getElementById('resNormalBtn');
  const resHdBtn = document.getElementById('resHdBtn');
  const resUltraBtn = document.getElementById('resUltraBtn');

  const setResolution = (val) => {
    state.asciiWidth = val;
    asciiWidthSlider.value = val;
    asciiWidthVal.innerText = val;
    updateAsciiAndRender();
  };

  if (resMarkdownOptBtn) resMarkdownOptBtn.addEventListener('click', () => setResolution(42));
  if (resNormalBtn) resNormalBtn.addEventListener('click', () => setResolution(45));
  if (resHdBtn) resHdBtn.addEventListener('click', () => setResolution(75));
  if (resUltraBtn) resUltraBtn.addEventListener('click', () => setResolution(110));

  const asciiFontScaleSlider = document.getElementById('asciiFontScaleSlider');
  const asciiFontScaleVal = document.getElementById('asciiFontScaleVal');

  if (asciiFontScaleSlider) {
    asciiFontScaleSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.customFontSize = val;
      if (asciiFontScaleVal) {
        asciiFontScaleVal.innerText = val > 0 ? `${val}px` : 'Auto';
      }
      renderPreview();
    });
  }

  const fontAutoBtn = document.getElementById('fontAutoBtn');
  if (fontAutoBtn && asciiFontScaleSlider) {
    fontAutoBtn.addEventListener('click', () => {
      asciiFontScaleSlider.value = 0;
      state.customFontSize = 0;
      if (asciiFontScaleVal) asciiFontScaleVal.innerText = 'Auto';
      renderPreview();
      showToast('Font boyutu Otomatik (Auto) olarak sıfırlandı.');
    });
  }

  asciiWidthSlider.addEventListener('input', (e) => {
    state.asciiWidth = parseInt(e.target.value);
    asciiWidthVal.innerText = state.asciiWidth;
    updateAsciiAndRender();
  });

  contrastSlider.addEventListener('input', (e) => {
    state.contrast = parseFloat(e.target.value);
    contrastVal.innerText = state.contrast;
    updateAsciiAndRender();
  });

  // Auto Enhance Controls
  const autoEnhanceCheck = document.getElementById('autoEnhanceCheck');
  const edgeSlider = document.getElementById('edgeSlider');
  const edgeVal = document.getElementById('edgeVal');
  const bgThresholdSlider = document.getElementById('bgThresholdSlider');
  const bgThresholdVal = document.getElementById('bgThresholdVal');
  const ditherCheck = document.getElementById('ditherCheck');

  if (autoEnhanceCheck) {
    autoEnhanceCheck.addEventListener('change', (e) => {
      state.autoEnhance = e.target.checked;
      updateAsciiAndRender();
    });
  }

  if (edgeSlider) {
    edgeSlider.addEventListener('input', (e) => {
      state.edgeSharpen = parseInt(e.target.value) / 100;
      if (edgeVal) edgeVal.innerText = `${e.target.value}%`;
      updateAsciiAndRender();
    });
  }

  if (bgThresholdSlider) {
    bgThresholdSlider.addEventListener('input', (e) => {
      state.bgThreshold = parseInt(e.target.value);
      if (bgThresholdVal) bgThresholdVal.innerText = state.bgThreshold;
      updateAsciiAndRender();
    });
  }

  if (ditherCheck) {
    ditherCheck.addEventListener('change', (e) => {
      state.dither = e.target.checked;
      updateAsciiAndRender();
    });
  }

  charSetSelect.addEventListener('change', (e) => {
    state.charSetKey = e.target.value;
    updateAsciiAndRender();
  });

  invertCheck.addEventListener('change', (e) => {
    state.invert = e.target.checked;
    updateAsciiAndRender();
  });

  // Header Title & Separator
  headerTitleInput.addEventListener('input', (e) => {
    state.headerTitle = e.target.value;
    renderPreview();
  });

  headerSepInput.addEventListener('input', (e) => {
    state.headerSeparator = e.target.value;
    renderPreview();
  });

  // Theme Select
  themeSelect.addEventListener('change', (e) => {
    state.themeKey = e.target.value;
    renderPreview();
  });

  // Preset Loader
  presetSelect.addEventListener('change', (e) => {
    const key = e.target.value;
    if (!key || !PRESETS[key]) return;

    const preset = PRESETS[key];
    state.headerTitle = preset.title;
    state.headerSeparator = preset.separator;
    state.themeKey = preset.theme;

    // Flatten sections into fields
    const flatFields = [];
    preset.sections.forEach(sec => {
      sec.fields.forEach(f => flatFields.push({ ...f }));
    });
    state.fields = flatFields;

    headerTitleInput.value = preset.title;
    headerSepInput.value = preset.separator;
    themeSelect.value = preset.theme;

    renderFieldsEditor();
    renderPreview();
    showToast(`Loaded preset: ${preset.name}`);
  });

  // Image Upload / Drag Drop
  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => loadImageSource(evt.target.result);
      reader.readAsDataURL(file);
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--accent-primary)';
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => loadImageSource(evt.target.result);
      reader.readAsDataURL(file);
    }
  });

  imageUrlInput.addEventListener('change', (e) => {
    if (e.target.value.trim()) loadImageSource(e.target.value.trim());
  });

  // Field Editor Events (Instant 2-Way Binding)
  fieldsContainer.addEventListener('input', (e) => {
    const idxStr = e.target.dataset.index;
    const type = e.target.dataset.type;
    if (idxStr !== undefined && type) {
      const idx = parseInt(idxStr, 10);
      if (!isNaN(idx) && state.fields[idx]) {
        if (type === 'header') {
          state.fields[idx].key = `SECTION: ${e.target.value}`;
          state.fields[idx].value = e.target.value;
        } else {
          state.fields[idx][type] = e.target.value;
        }
        renderPreview();
      }
    }
  });

  fieldsContainer.addEventListener('click', (e) => {
    const deleteIdxStr = e.target.dataset.delete;
    const moveUpIdxStr = e.target.dataset.moveUp;
    const moveDownIdxStr = e.target.dataset.moveDown;

    if (deleteIdxStr !== undefined) {
      const deleteIdx = parseInt(deleteIdxStr, 10);
      if (!isNaN(deleteIdx)) {
        state.fields.splice(deleteIdx, 1);
        renderFieldsEditor();
        renderPreview();
      }
    } else if (moveUpIdxStr !== undefined) {
      const idx = parseInt(moveUpIdxStr, 10);
      if (!isNaN(idx) && idx > 0) {
        const temp = state.fields[idx];
        state.fields[idx] = state.fields[idx - 1];
        state.fields[idx - 1] = temp;
        renderFieldsEditor();
        renderPreview();
      }
    } else if (moveDownIdxStr !== undefined) {
      const idx = parseInt(moveDownIdxStr, 10);
      if (!isNaN(idx) && idx < state.fields.length - 1) {
        const temp = state.fields[idx];
        state.fields[idx] = state.fields[idx + 1];
        state.fields[idx + 1] = temp;
        renderFieldsEditor();
        renderPreview();
      }
    }
  });

  addFieldBtn.addEventListener('click', () => {
    state.fields.push({ key: "New.Key", value: "New Value" });
    renderFieldsEditor();
    renderPreview();
  });

  const addHeaderBtn = document.getElementById('addHeaderBtn');
  if (addHeaderBtn) {
    addHeaderBtn.addEventListener('click', () => {
      state.fields.push({ key: "SECTION: New Section", value: "New Section" });
      renderFieldsEditor();
      renderPreview();
    });
  }

  const addSpaceBtn = document.getElementById('addSpaceBtn');
  if (addSpaceBtn) {
    addSpaceBtn.addEventListener('click', () => {
      state.fields.push({ key: "", value: "" });
      renderFieldsEditor();
      renderPreview();
    });
  }

  // GitHub Auto Import
  ghImportBtn.addEventListener('click', async () => {
    const user = ghUsernameInput.value.trim();
    if (!user) return showToast('Please enter a GitHub username.');

    ghImportBtn.innerText = 'Fetching...';
    try {
      const data = await fetchGitHubUser(user);
      
      // Set title
      state.headerTitle = `${data.username}@github`;
      state.headerSeparator = "-".repeat(state.headerTitle.length);
      headerTitleInput.value = state.headerTitle;
      headerSepInput.value = state.headerSeparator;

      // Build full neofetch template with real data
      state.fields = [
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

      renderFieldsEditor();

      if (data.avatarUrl) {
        loadImageSource(data.avatarUrl);
      } else {
        renderPreview();
      }

      showToast(`Imported GitHub profile: @${data.username}`);
    } catch (err) {
      showToast(err.message || 'GitHub import failed.');
    } finally {
      ghImportBtn.innerText = 'Fetch';
    }
  });

  // Copy Markdown
  const copyMarkdown = () => {
    const statsLines = buildStatsLines(state.headerTitle, state.headerSeparator, [{ name: "", fields: state.fields }]);
    const mergedLines = mergeSideBySide(state.asciiLines, statsLines);
    const mdCode = buildMarkdownCodeBlock(mergedLines);
    navigator.clipboard.writeText(mdCode);
    showToast('Markdown code kopyalandı! README.md dosyasına yapıştırabilirsiniz.');
  };

  copyMarkdownBtn.addEventListener('click', copyMarkdown);
  quickCopyBtn.addEventListener('click', copyMarkdown);

  // Download SVG
  downloadSvgBtn.addEventListener('click', () => {
    const statsLines = buildStatsLines(state.headerTitle, state.headerSeparator, [{ name: "", fields: state.fields }]);
    const svgContent = generateSvgCard(state.asciiLines, statsLines, {
      themeKey: state.themeKey,
      fontSize: state.customFontSize > 0 ? state.customFontSize : undefined
    });

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `readme_neofetch_${state.themeKey}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('SVG kartı indirildi! (readme_neofetch.svg)');
  });
}

// Launch
init();
