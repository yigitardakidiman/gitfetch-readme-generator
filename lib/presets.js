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
          { key: "Location", value: "Night City / Remote" }
        ]
      }
    ],
    theme: "cyberpunk"
  },

  minimal: {
    name: "Minimalist Developer",
    title: "dev@laptop",
    separator: "------------",
    sections: [
      {
        name: "Overview",
        fields: [
          { key: "Role", value: "Frontend Engineer" },
          { key: "Stack", value: "React, Next.js, Node.js" },
          { key: "Focus", value: "UI/UX & Performance" },
          { key: "Location", value: "Istanbul, Turkey" }
        ]
      }
    ],
    theme: "nord"
  }
};

export const COLOR_THEMES = {
  dracula: {
    name: "Dracula Dark",
    bg: "#282a36",
    cardBg: "#1e1f29",
    text: "#f8f8f2",
    title: "#bd93f9",
    key: "#8be9fd",
    value: "#f1fa8c",
    ascii: "#ff79c6",
    separator: "#6272a4",
    dots: ["#ff5555", "#f1fa8c", "#50fa7b"]
  },
  cyberpunk: {
    name: "Cyberpunk Neon",
    bg: "#0d0221",
    cardBg: "#050014",
    text: "#00f0ff",
    title: "#ff0055",
    key: "#ffe600",
    value: "#00f0ff",
    ascii: "#ff0055",
    separator: "#7000ff",
    dots: ["#ff0055", "#ffe600", "#00f0ff"]
  },
  monokai: {
    name: "Monokai Pro",
    bg: "#2d2a2e",
    cardBg: "#221f22",
    text: "#fcfcfa",
    title: "#ffd866",
    key: "#78dce8",
    value: "#a9dc76",
    ascii: "#ff6188",
    separator: "#727072",
    dots: ["#ff6188", "#ffd866", "#a9dc76"]
  },
  matrix: {
    name: "Matrix Emerald",
    bg: "#0a0f0d",
    cardBg: "#050807",
    text: "#00ff66",
    title: "#00ffcc",
    key: "#33ff99",
    value: "#e0ffea",
    ascii: "#00ff66",
    separator: "#1a5e38",
    dots: ["#ff3333", "#ffcc00", "#00ff66"]
  },
  nord: {
    name: "Nord Frost",
    bg: "#2e3440",
    cardBg: "#242933",
    text: "#eceff4",
    title: "#88c0d0",
    key: "#81a1c1",
    value: "#a3be8c",
    ascii: "#8fbcbb",
    separator: "#4c566a",
    dots: ["#bf616a", "#ebcb8b", "#a3be8c"]
  },
  solarized: {
    name: "Solarized Dark",
    bg: "#002b36",
    cardBg: "#00212b",
    text: "#839496",
    title: "#b58900",
    key: "#268bd2",
    value: "#2aa198",
    ascii: "#cb4b16",
    separator: "#586e75",
    dots: ["#dc322f", "#b58900", "#859900"]
  },
  amber: {
    name: "Retro Amber Terminal",
    bg: "#120c02",
    cardBg: "#0a0701",
    text: "#ffb000",
    title: "#ffc83b",
    key: "#ffa000",
    value: "#ffe082",
    ascii: "#ffb000",
    separator: "#805800",
    dots: ["#ff4500", "#ffb000", "#32cd32"]
  }
};
