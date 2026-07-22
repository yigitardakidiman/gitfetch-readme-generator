/**
 * Neofetch Monospace Text Grid Builder
 * Combines ASCII art lines with key-value stats lines into a side-by-side terminal grid.
 */

/**
 * Format a list of section field objects into text lines
 * @param {string} title - User title (e.g. andrew@grant)
 * @param {string} separator - Separator bar (e.g. ------------)
 * @param {Array} sections - Section objects with fields
 * @param {Object} options - Formatting options
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
      // Blank line = group separator
      if (current.items.length > 0 || current.type !== 'fields') {
        groups.push(current);
      }
      current = { type: 'fields', items: [] };
    } else if (f.key && (f.key.startsWith('SECTION:') || f.key.startsWith('---'))) {
      // Section header
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
    // Add blank line before groups (except first one right after separator)
    if (gIdx > 0) {
      lines.push("");
    }

    if (group.type === 'header') {
      const hdr = group.title || 'Section';
      lines.push(`- ${hdr} ${"-".repeat(Math.max(10, 42 - hdr.length))}`);
      return;
    }

    if (group.items.length === 0) return;

    // Find max key width in this group for dot alignment
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

/**
 * Merge ASCII lines (left) and Stats lines (right) side by side
 * @param {string[]} asciiLines - Array of ASCII art lines
 * @param {string[]} statsLines - Array of Neofetch stats lines
 * @param {number} gap - Column spacing in characters
 */
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

/**
 * Generate formatted Markdown text block
 */
export function buildMarkdownCodeBlock(mergedLines) {
  return "```text\n" + mergedLines.join("\n") + "\n```";
}

/**
 * Generate formatted HTML <pre> block for GitHub README with custom font-size
 */
export function buildHtmlPreBlock(mergedLines, fontSize = 10) {
  const escapedText = mergedLines.join("\n")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<pre style="font-size: ${fontSize}px; line-height: 1.15; font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace;">\n${escapedText}\n</pre>`;
}
