import { fetchGitHubUser } from '@/lib/github-api';
import { getDefaultAsciiAvatar } from '@/lib/ascii-engine';
import { buildStatsLines } from '@/lib/neofetch-builder';
import { generateSvgCard } from '@/lib/svg-exporter';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user') || searchParams.get('username');
  const themeKey = searchParams.get('theme') || 'dracula';
  const fontSize = searchParams.get('fontSize') ? parseFloat(searchParams.get('fontSize')) : undefined;

  let title = user ? `${user}@github` : 'username@hostname';
  let asciiLines = getDefaultAsciiAvatar();

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

  if (user) {
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
    fontSize
  });

  return new Response(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml;charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
