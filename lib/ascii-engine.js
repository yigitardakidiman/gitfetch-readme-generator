/**
 * Advanced Smart ASCII Art Processing Engine
 * Includes Edge Detection, Auto-Contrast Equalization, Dithering, and Background Cleaning.
 */

export const CHAR_SETS = {
  detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
  standard: '@%#*+=-:. ',
  blocks: '█▓▒░ ',
  edgeLine: ' /\\|-_+=:~.',
  retro: 'NM%g|i;:,. '
};

/**
 * Main ASCII Conversion Function
 */
export function imageToAscii(img, options = {}) {
  const {
    width = 45,
    charSetKey = 'detailed',
    customCharSet = '',
    contrast = 1.0,
    brightness = 0,
    invert = false,
    aspectRatio = 0.52,
    autoEnhance = true,
    edgeSharpen = 0.4,       // 0.0 to 1.0 (Sobel edge blending)
    bgThreshold = 0,         // Remove low background noise (0 to 50)
    dither = false           // Floyd-Steinberg dithering
  } = options;

  return new Promise((resolve, reject) => {
    try {
      const charSet = customCharSet || CHAR_SETS[charSetKey] || CHAR_SETS.detailed;
      const height = Math.max(1, Math.round((img.height / img.width) * width * aspectRatio));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      let data = imageData.data;

      // 1. Sample 4 corners to detect solid/light background color
      const cornerRgb = getCornerBackgroundColor(data, width, height);

      // 2. Convert to grayscale float grid and apply Smart Background Removal
      let grayGrid = new Float32Array(width * height);
      let alphaGrid = new Uint8Array(width * height);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          const gridIdx = y * width + x;
          alphaGrid[gridIdx] = a;

          // Transparent check
          if (a < 50) {
            grayGrid[gridIdx] = 255; // Space
            alphaGrid[gridIdx] = 0;
            continue;
          }

          // Smart Background Match check (if corner background detected)
          if (cornerRgb && isColorMatch(r, g, b, cornerRgb, 35)) {
            grayGrid[gridIdx] = 255; // Space
            alphaGrid[gridIdx] = 0;
            continue;
          }

          // Luminance formula
          grayGrid[gridIdx] = 0.299 * r + 0.587 * g + 0.114 * b;
        }
      }

      // 2. Auto-Enhance: Dynamic Range Stretch (Histogram Normalization)
      if (autoEnhance) {
        grayGrid = autoStretchContrast(grayGrid, width, height);
      }

      // 3. Sobel Edge Detection for sharp facial/subject outlines
      let edgeGrid = null;
      let edgeDirGrid = null;
      if (edgeSharpen > 0) {
        const edgeRes = applySobelEdges(grayGrid, width, height);
        edgeGrid = edgeRes.magnitude;
        edgeDirGrid = edgeRes.direction;
      }

      // 4. Optional Floyd-Steinberg Dithering
      if (dither) {
        grayGrid = applyDithering(grayGrid, width, height);
      }

      // 5. Build ASCII Character Grid
      const lines = [];

      for (let y = 0; y < height; y++) {
        let line = '';
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const alpha = alphaGrid[idx];

          if (alpha < 50) {
            line += ' ';
            continue;
          }

          let val = grayGrid[idx];

          // Apply manual brightness & contrast
          val += brightness;
          val = (val - 128) * contrast + 128;
          val = Math.max(0, Math.min(255, val));

          // Background noise suppression
          if (bgThreshold > 0 && val > (255 - bgThreshold)) {
            line += ' ';
            continue;
          }

          if (invert) {
            val = 255 - val;
          }

          // Edge character substitution if strong edge detected
          let char = null;
          if (edgeSharpen > 0 && edgeGrid[idx] > (180 * (1.1 - edgeSharpen))) {
            const dir = edgeDirGrid[idx]; // 0: horizontal, 1: vertical, 2: diag1, 3: diag2
            if (dir === 0) char = '|';
            else if (dir === 1) char = '-';
            else if (dir === 2) char = '/';
            else if (dir === 3) char = '\\';
          }

          if (!char) {
            const charIdx = Math.floor((val / 255) * (charSet.length - 1));
            char = charSet[charIdx] || ' ';
          }

          line += char;
        }
        lines.push(line);
      }

      resolve(lines);
    } catch (err) {
      reject(err);
    }
  });
}

function getCornerBackgroundColor(data, width, height) {
  const corners = [
    0,
    (width - 1) * 4,
    (height - 1) * width * 4,
    ((height - 1) * width + (width - 1)) * 4
  ];

  const colors = corners.map(idx => ({
    r: data[idx],
    g: data[idx + 1],
    b: data[idx + 2],
    a: data[idx + 3]
  })).filter(c => c.a > 50);

  if (colors.length < 2) return null;

  const base = colors[0];
  let matches = 0;
  for (let i = 1; i < colors.length; i++) {
    if (isColorMatch(colors[i].r, colors[i].g, colors[i].b, base, 30)) {
      matches++;
    }
  }

  if (matches >= 1) {
    const lum = 0.299 * base.r + 0.587 * base.g + 0.114 * base.b;
    if (lum > 160) {
      return base;
    }
  }

  return null;
}

function isColorMatch(r, g, b, targetRgb, threshold = 35) {
  const diffR = Math.abs(r - targetRgb.r);
  const diffG = Math.abs(g - targetRgb.g);
  const diffB = Math.abs(b - targetRgb.b);
  return (diffR + diffG + diffB) / 3 <= threshold;
}

function autoStretchContrast(grayGrid, width, height) {
  let minVal = 255;
  let maxVal = 0;

  for (let i = 0; i < grayGrid.length; i++) {
    const v = grayGrid[i];
    if (v < minVal) minVal = v;
    if (v > maxVal) maxVal = v;
  }

  const range = maxVal - minVal;
  if (range <= 0) return grayGrid;

  const result = new Float32Array(grayGrid.length);
  for (let i = 0; i < grayGrid.length; i++) {
    const norm = (grayGrid[i] - minVal) / range;
    const gamma = Math.pow(norm, 0.9);
    result[i] = gamma * 255;
  }
  return result;
}

function applySobelEdges(grayGrid, width, height) {
  const magnitude = new Float32Array(width * height);
  const direction = new Uint8Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p0 = grayGrid[(y - 1) * width + (x - 1)];
      const p1 = grayGrid[(y - 1) * width + x];
      const p2 = grayGrid[(y - 1) * width + (x + 1)];
      const p3 = grayGrid[y * width + (x - 1)];
      const p5 = grayGrid[y * width + (x + 1)];
      const p6 = grayGrid[(y + 1) * width + (x - 1)];
      const p7 = grayGrid[(y + 1) * width + x];
      const p8 = grayGrid[(y + 1) * width + (x + 1)];

      const gx = (-1 * p0) + (1 * p2) + (-2 * p3) + (2 * p5) + (-1 * p6) + (1 * p8);
      const gy = (-1 * p0) + (-2 * p1) + (-1 * p2) + (1 * p6) + (2 * p7) + (1 * p8);

      const mag = Math.sqrt(gx * gx + gy * gy);
      const idx = y * width + x;
      magnitude[idx] = mag;

      const angle = Math.atan2(gy, gx) * (180 / Math.PI);
      let dir = 0;
      if ((angle >= -22.5 && angle < 22.5) || angle >= 157.5 || angle < -157.5) {
        dir = 0;
      } else if ((angle >= 67.5 && angle < 112.5) || (angle >= -112.5 && angle < -67.5)) {
        dir = 1;
      } else if ((angle >= 22.5 && angle < 67.5) || (angle >= -157.5 && angle < -112.5)) {
        dir = 2;
      } else {
        dir = 3;
      }
      direction[idx] = dir;
    }
  }

  return { magnitude, direction };
}

function applyDithering(grayGrid, width, height) {
  const result = new Float32Array(grayGrid);

  for (let y = 0; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const oldVal = result[y * width + x];
      const newVal = oldVal < 128 ? 0 : 255;
      result[y * width + x] = newVal;
      const err = oldVal - newVal;

      result[y * width + (x + 1)] += err * (7 / 16);
      result[(y + 1) * width + (x - 1)] += err * (3 / 16);
      result[(y + 1) * width + x] += err * (5 / 16);
      result[(y + 1) * width + (x + 1)] += err * (1 / 16);
    }
  }
  return result;
}

export function getDefaultAsciiAvatar() {
  return [
    "       g@M%V@%@v%N%Ww,      ",
    "     ,.M*||*%'gNM=]mM%g||%N,",
    "     p!  ' | ' ' ' ''||jhlj%W",
    "    ,@L  '''||''|||j%M]M    ",
    "   ..jJ'''''''''''''''''''i%Wg",
    " /{|j]@@@@@@@@@pp,.         ",
    " `]'|eeeeeeeeeeeeep         ",
    "  :]%%%%@@@@@@%%%k%h '*||mkr",
    "  j%M'   |jkk'  -~nrn=p|'   ",
    " :|jrr^~             '| L'':!",
    " j lp:,.  / @@  .:;\\nmy '   ",
    " i r eeee@@M%M eeee ,*^*,p ::",
    " H|%%%%%j%k||..;;:]]%i]j]%  ",
    " \"djjmkl,\"]|[],,,wwxw;/#kjk` ",
    "  %;%k%%%%M]M%%yjkkii|||[   ",
    "  kjj%kkkl|||||||i]|||      ",
    "  |jM%H@@@b%%kkmk%i!,|[     ",
    "  {@pj%%%%jkk||j]'**;]%     ",
    "  |j@@@g|''':.:;j%k         ",
    "  @@@@0mgmp;;..;;jj%k%      ",
    " =[' ' . %h%%%%%%Hgkilljjj%kk%`"
  ];
}
