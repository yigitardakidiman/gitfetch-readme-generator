import { fetchGitHubUser } from '@/lib/github-api';
import { getDefaultAsciiAvatar, rgbaToAscii } from '@/lib/ascii-engine';
import { PRESET_ASCII_LIBRARY } from '@/lib/ascii-presets';
import { buildStatsLines } from '@/lib/neofetch-builder';
import { generateSvgCard } from '@/lib/svg-exporter';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';

export const runtime = 'nodejs';

async function fetchAvatarAscii(avatarUrl, width = 38) {
  try {
    const res = await fetch(avatarUrl);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let decoded = null;
    if (avatarUrl.includes('.png') || buffer[0] === 0x89) {
      const png = PNG.sync.read(buffer);
      decoded = { width: png.width, height: png.height, data: png.data };
    } else {
      const jpg = jpeg.decode(buffer, { useTolerantDecoder: true });
      decoded = { width: jpg.width, height: jpg.height, data: jpg.data };
    }

    if (decoded && decoded.data) {
      return rgbaToAscii(decoded.data, decoded.width, decoded.height, { width });
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
        { key: "OS", value: "Ubuntu Linux, macOS, Web" },
        { key: "Uptime", value: data.uptime },
        { key: "Host", value: data.company },
        { key: "Bio", value: data.bio || "Open Source Developer" },
        { key: "", value: "" },
        { key: "SECTION: GitHub Stats", value: "GitHub Stats" },
        { key: "Repos", value: `${data.publicRepos} Public Repos` },
        { key: "Followers", value: `${data.followers} Followers` },
        { key: "Stars", value: `${data.stars} Total Stars` }
      ];
      if (data.avatarUrl) {
        const serverAscii = await fetchAvatarAscii(data.avatarUrl);
        if (serverAscii && serverAscii.length > 0) {
          asciiLines = serverAscii;
        }
      }
    } catch (e) {
      console.warn("API route GitHub fetch fallback:", e);
    }
  }

  const separator = "-".repeat(title.length);
  const statsLines = buildStatsLines(title, separator, [{ name: "", fields }]);

  const svgContent = generateSvgCard(asciiLines, statsLines, {
    themeKey,
    customTheme,
    fontSize
  });

  return new Response(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml;charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
