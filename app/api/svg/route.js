import { fetchGitHubUser } from '@/lib/github-api';
import { getDefaultAsciiAvatar } from '@/lib/ascii-engine';
import { PRESET_ASCII_LIBRARY } from '@/lib/ascii-presets';
import { buildStatsLines } from '@/lib/neofetch-builder';
import { generateSvgCard } from '@/lib/svg-exporter';

export const runtime = 'nodejs';

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
      const decodedString = Buffer.from(configParam, 'base64url').toString('utf-8');
      const decoded = JSON.parse(decodedString);
      if (decoded.asciiLines && Array.isArray(decoded.asciiLines)) asciiLines = decoded.asciiLines;
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
