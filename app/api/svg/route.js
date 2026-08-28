import { fetchGitHubUser } from '@/lib/github-api';
import { getDefaultAsciiAvatar, rgbaToAscii } from '@/lib/ascii-engine';
import { PRESET_ASCII_LIBRARY } from '@/lib/ascii-presets';
import { buildStatsLines } from '@/lib/neofetch-builder';
import { generateSvgCard } from '@/lib/svg-exporter';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';

export const runtime = 'nodejs';

async function fetchAvatarAscii(avatarUrl, width = 54, asciiOptions = {}) {
  try {
    const targetUrl = avatarUrl.includes('githubusercontent.com')
      ? (avatarUrl.includes('?') ? `${avatarUrl}&s=200` : `${avatarUrl}?s=200`)
      : avatarUrl;

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/png,image/jpeg,image/*;q=0.9'
      }
    });

    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let decoded = null;

    // 1. Try PNG decoding
    try {
      const png = PNG.sync.read(buffer);
      if (png && png.width && png.height && png.data) {
        decoded = { width: png.width, height: png.height, data: png.data };
      }
    } catch (_) {}

    // 2. Try JPEG decoding if PNG failed
    if (!decoded) {
      try {
        const jpg = jpeg.decode(buffer, { useTolerantDecoder: true, maxMemoryUsageInMB: 512 });
        if (jpg && jpg.width && jpg.height && jpg.data) {
          decoded = { width: jpg.width, height: jpg.height, data: jpg.data };
        }
      } catch (_) {}
    }

    if (decoded && decoded.data) {
      return rgbaToAscii(decoded.data, decoded.width, decoded.height, {
        width,
        autoEnhance: true,
        edgeSharpen: asciiOptions.edgeSharpen !== undefined ? asciiOptions.edgeSharpen : 0.4,
        contrast: asciiOptions.contrast !== undefined ? asciiOptions.contrast : 1.2,
        charSetKey: asciiOptions.charSetKey || 'detailed',
        invert: asciiOptions.invert || false
      });
    }
  } catch (e) {
    console.warn("Failed to convert avatar to ASCII on server:", e);
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user') || searchParams.get('username');
  const themeKey = searchParams.get('theme') || 'dracula';
  const presetAsciiKey = searchParams.get('presetAscii');
  const fontSize = searchParams.get('fontSize') ? parseFloat(searchParams.get('fontSize')) : undefined;
  const configParam = searchParams.get('config');

  const userWidthParam = searchParams.get('asciiWidth') || searchParams.get('width');
  const targetAsciiWidth = userWidthParam ? parseInt(userWidthParam, 10) : 55;

  const edgeSharpenParam = searchParams.get('edgeSharpen') ? parseFloat(searchParams.get('edgeSharpen')) : 0.4;
  const contrastParam = searchParams.get('contrast') ? parseFloat(searchParams.get('contrast')) : 1.2;
  const charSetKeyParam = searchParams.get('charSetKey') || searchParams.get('charSet') || 'detailed';
  const invertParam = searchParams.get('invert') === 'true';

  const asciiOptions = {
    edgeSharpen: edgeSharpenParam,
    contrast: contrastParam,
    charSetKey: charSetKeyParam,
    invert: invertParam
  };

  let title = user ? `${user}@github` : 'username@hostname';
  let asciiLines = getDefaultAsciiAvatar();

  if (presetAsciiKey && PRESET_ASCII_LIBRARY[presetAsciiKey]) {
    asciiLines = PRESET_ASCII_LIBRARY[presetAsciiKey].lines;
  }

  let fields = [
    { key: "OS", value: "Windows 11, macOS 15, Linux" },
    { key: "Uptime", value: "4 years, 7 months" },
    { key: "Host", value: "Full-Stack Developer" },
    { key: "", value: "" },
    { key: "Languages", value: "TypeScript, Python, Rust, Go" },
    { key: "SECTION: Contact", value: "Contact" },
    { key: "Website", value: "https://your-website.dev" },
    { key: "SECTION: GitHub Stats", value: "GitHub Stats" },
    { key: "Repos", value: "42 | Stars: 156" }
  ];

  let customTheme = null;

  // Attempt to load compressed custom config from URL parameter
  if (configParam) {
    try {
      let rawParam = configParam;
      if (rawParam.includes('%')) {
        try { rawParam = decodeURIComponent(rawParam); } catch (_) {}
      }
      const base64 = rawParam.replace(/-/g, '+').replace(/_/g, '/');
      let decodedString = Buffer.from(base64, 'base64').toString('utf-8');
      if (decodedString.includes('%7B') || decodedString.includes('%22')) {
        try { decodedString = decodeURIComponent(decodedString); } catch (_) {}
      }
      const decoded = JSON.parse(decodedString);
      if (decoded.asciiLines && Array.isArray(decoded.asciiLines) && decoded.asciiLines.length > 0) {
        asciiLines = decoded.asciiLines;
      } else if (user) {
        try {
          const data = await fetchGitHubUser(user);
          if (data.avatarUrl) {
            const serverAscii = await fetchAvatarAscii(data.avatarUrl, targetAsciiWidth, asciiOptions);
            if (serverAscii && serverAscii.length > 0) asciiLines = serverAscii;
          }
        } catch (e) {
          console.warn("Config avatar fetch error:", e);
        }
      }
      if (decoded.fields && Array.isArray(decoded.fields)) fields = decoded.fields;
      if (decoded.headerTitle) title = decoded.headerTitle;
      if (decoded.customTheme) customTheme = decoded.customTheme;
    } catch (e) {
      console.warn("Could not decode SVG config param:", e);
    }
  } else if (user) {
    try {
      const data = await fetchGitHubUser(user);
      title = `${data.username}@github`;
      fields = [
        { key: "OS", value: "Windows 11, macOS 15, Linux" },
        { key: "Uptime", value: data.uptime },
        { key: "Host", value: data.company || "Freelance / Open Source" },
        { key: "Kernel", value: data.bio || "Full-Stack Developer" },
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
        { key: "Website", value: data.blog || "https://www.kidiman.com/" },
        { key: "LinkedIn", value: data.linkedin || "your-linkedin" },
        { key: "Twitter/X", value: data.twitter ? `@${data.twitter}` : "@your-handle" },
        { key: "Discord", value: data.username },
        { key: "Location", value: data.location || "Earth" },
        { key: "", value: "" },
        { key: "SECTION: GitHub Stats", value: "GitHub Stats" },
        { key: "Repos", value: `${data.publicRepos} | Stars: ${data.stars}` },
        { key: "Followers", value: `${data.followers} | Following: ${data.following}` }
      ];
      if (data.avatarUrl) {
        const serverAscii = await fetchAvatarAscii(data.avatarUrl, targetAsciiWidth, asciiOptions);
        if (serverAscii && serverAscii.length > 0) {
          asciiLines = serverAscii;
        }
      }
    } catch (e) {
      console.warn("API route GitHub fetch fallback:", e);
    }
  }

  const animateParam = searchParams.get('animate');
  const cursorParam = searchParams.get('cursor');
  const fadeParam = searchParams.get('fade');
  const typewriterParam = searchParams.get('typewriter');

  const animateCursor = cursorParam === 'true' || cursorParam === '1' || animateParam === 'true' || animateParam === '1';
  const animateFade = fadeParam === 'true' || fadeParam === '1';
  const animateTypewriter = typewriterParam === 'true' || typewriterParam === '1' || animateParam === 'true' || animateParam === '1';

  const separator = "-".repeat(title.length);
  const statsLines = buildStatsLines(title, separator, [{ name: "", fields }]);

  const svgContent = generateSvgCard(asciiLines, statsLines, {
    themeKey,
    customTheme,
    fontSize,
    animateCursor,
    animateFade,
    animateTypewriter
  });

  return new Response(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml;charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
