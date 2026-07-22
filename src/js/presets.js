/**
 * Pre-defined Neofetch Templates & Styling Presets
 */

export const PRESETS = {
  neofetch: {
    name: "Neofetch Template (Reference)",
    title: "username@hostname",
    separator: "-------------------",
    sections: [
      {
        name: "",
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
      }
    ],
    theme: "dracula"
  },

  cyberpunk: {
    name: "Cyberpunk / Neon Hacker",
    title: "root@cyber-net",
    separator: "====================",
    sections: [
      {
        name: "System Node",
        fields: [
          { key: "Cyberware", value: "Neural Interface v4.2" },
          { key: "OS", value: "Arch Linux (Custom Kernel 6.10)" },
          { key: "Shell", value: "zsh 5.9 (oh-my-zsh + powerlevel10k)" },
          { key: "Terminal", value: "Alacritty + Tmux" },
          { key: "Editor", value: "Neovim (LazyVim setup)" }
        ]
      },
      {
        name: "Tech Matrix",
        fields: [
          { key: "Core", value: "Rust, TypeScript, Go, C++" },
          { key: "Web", value: "Next.js, TailwindCSS, WebGL, Three.js" },
          { key: "Infra", value: "Docker, Kubernetes, AWS, Cloudflare" }
        ]
      },
      {
        name: "Identity",
        fields: [
          { key: "Status", value: "Building the decentralized future" },
          { key: "Matrix / Matrix", value: "@cyber:matrix.org" },
          { key: "GitHub", value: "github.com/cyber-dev" }
        ]
      }
    ],
    theme: "cyberpunk"
  },

  minimal: {
    name: "Minimalist Developer",
    title: "dev@localhost",
    separator: "--------------------",
    sections: [
      {
        name: "Profile",
        fields: [
          { key: "Role", value: "Senior Frontend Engineer" },
          { key: "Location", value: "Remote / Europe" },
          { key: "Focus", value: "UI/UX Architecture & Web Performance" }
        ]
      },
      {
        name: "Stack",
        fields: [
          { key: "Languages", value: "JavaScript, TypeScript, HTML/CSS" },
          { key: "Frameworks", value: "React, Vue.js, Svelte, Vite" }
        ]
      },
      {
        name: "Links",
        fields: [
          { key: "GitHub", value: "github.com/username" },
          { key: "Website", value: "https://dev.portfolio" }
        ]
      }
    ],
    theme: "nord"
  }
};

export const COLOR_THEMES = {
  dracula: {
    name: "Dracula",
    bg: "#1e1e2e",
    cardBg: "#181825",
    text: "#cdd6f4",
    title: "#89b4fa",
    separator: "#585b70",
    key: "#f38ba8",
    value: "#b4befe",
    dots: ["#f38ba8", "#f9e2af", "#a6e3a1"],
    ascii: "#89b4fa"
  },
  cyberpunk: {
    name: "Cyberpunk Neon",
    bg: "#0d0221",
    cardBg: "#050014",
    text: "#00f5d4",
    title: "#ff007f",
    separator: "#7b2cbf",
    key: "#ff007f",
    value: "#7000ff",
    dots: ["#ff007f", "#00f5d4", "#7000ff"],
    ascii: "#00f5d4"
  },
  monokai: {
    name: "Monokai Pro",
    bg: "#2d2a2e",
    cardBg: "#221f22",
    text: "#fcfcfa",
    title: "#ffd866",
    separator: "#727072",
    key: "#ff6188",
    value: "#a9dc76",
    dots: ["#ff6188", "#ffd866", "#a9dc76"],
    ascii: "#78dce8"
  },
  matrix: {
    name: "Matrix Emerald",
    bg: "#040d06",
    cardBg: "#020703",
    text: "#00ff66",
    title: "#33ff88",
    separator: "#006622",
    key: "#00cc44",
    value: "#99ffbb",
    dots: ["#004411", "#00cc44", "#00ff66"],
    ascii: "#00ff66"
  },
  nord: {
    name: "Nord Frost",
    bg: "#2e3440",
    cardBg: "#242933",
    text: "#eceff4",
    title: "#88c0d0",
    separator: "#4c566a",
    key: "#81a1c1",
    value: "#a3be8c",
    dots: ["#bf616a", "#ebcb8b", "#a3be8c"],
    ascii: "#8fbcbb"
  },
  solarized: {
    name: "Solarized Dark",
    bg: "#002b36",
    cardBg: "#00212b",
    text: "#839496",
    title: "#268bd2",
    separator: "#586e75",
    key: "#b58900",
    value: "#2aa198",
    dots: ["#dc322f", "#cb4b16", "#859900"],
    ascii: "#268bd2"
  },
  amber: {
    name: "Retro Amber Terminal",
    bg: "#120c02",
    cardBg: "#0a0701",
    text: "#ffb000",
    title: "#ffcc00",
    separator: "#885500",
    key: "#ffaa00",
    value: "#ffd566",
    dots: ["#ff3300", "#ffaa00", "#ffcc00"],
    ascii: "#ffb000"
  }
};
