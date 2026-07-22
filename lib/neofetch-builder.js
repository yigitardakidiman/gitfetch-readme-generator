/**
 * Neofetch Monospace Text Grid Builder
 * Combines ASCII art lines with key-value stats lines into a side-by-side terminal grid.
 */

export function buildStatsLines(title, separator, sections, options = {}) {
  const lines = [];

  // Header
  if (title) lines.push(title);
  if (separator) lines.push(separator);

  // Flatten all fields
  const allFields = [];
  sections.forEach(sec => {
    sec.fields.forEach(f => allFields.push(f));
  });

  // Split into groups by blank lines and section headers
  const groups = [];
  let current = { type: 'fields', items: [] };

  for (const f of allFields) {
    if (!f.key && !f.value) {
      if (current.items.length > 0 || current.type !== 'fields') {
        groups.push(current);
      }
      current = { type: 'fields', items: [] };
    } else if (f.key && (f.key.startsWith('SECTION:') || f.key.startsWith('---'))) {
      if (current.items.length > 0) {
        groups.push(current);
      }
      const headerTitle = f.value || f.key.replace(/^SECTION:\s*|^---\s*/, '').replace(/---$/, '').trim();
      groups.push({ type: 'header', title: headerTitle, items: [] });
      current = { type: 'fields', items: [] };
    } else {
      current.items.push(f);
    }
  }
  if (current.items.length > 0) {
    groups.push(current);
  }

  // Render groups
  groups.forEach((group, gIdx) => {
    if (gIdx > 0) {
      lines.push("");
    }

    if (group.type === 'header') {
      const hdr = group.title || 'Section';
      lines.push(`- ${hdr} ${"-".repeat(Math.max(10, 42 - hdr.length))}`);
      return;
    }

    if (group.items.length === 0) return;

    const maxKeyLen = group.items.reduce((max, f) => {
      if (!f.key) return max;
      const k = f.key.endsWith(':') ? f.key : `${f.key}:`;
      return Math.max(max, k.length);
    }, 0);

    const targetCol = Math.max(maxKeyLen + 2, 14);

    group.items.forEach(f => {
      if (!f.key) {
        lines.push(f.value || '');
        return;
      }

      const keyStr = f.key.endsWith(':') ? f.key : `${f.key}:`;
      const neededDots = Math.max(2, targetCol - keyStr.length);
      const dots = '.'.repeat(neededDots);
      lines.push(`${keyStr} ${dots} ${f.value || ''}`);
    });
  });

  return lines;
}

export function mergeSideBySide(asciiLines, statsLines, gap = 2) {
  const asciiWidth = asciiLines.reduce((max, line) => Math.max(max, (line || '').trimEnd().length), 0);
  const maxLines = Math.max(asciiLines.length, statsLines.length);
  const resultLines = [];
  const spacing = ' '.repeat(gap);

  for (let i = 0; i < maxLines; i++) {
    const leftRaw = (asciiLines[i] || '').trimEnd();
    const leftPadded = leftRaw.padEnd(asciiWidth, ' ');
    const right = statsLines[i] || '';

    if (right) {
      resultLines.push(`${leftPadded}${spacing}${right}`);
    } else {
      resultLines.push(leftPadded.trimEnd());
    }
  }

  return resultLines;
}

export function buildMarkdownCodeBlock(mergedLines) {
  return "```text\n" + mergedLines.join("\n") + "\n```";
}

export function buildHtmlPreBlock(mergedLines, fontSize = 10) {
  const escapedText = mergedLines.join("\n")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<pre style="font-size: ${fontSize}px; line-height: 1.15; font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace;">\n${escapedText}\n</pre>`;
}
