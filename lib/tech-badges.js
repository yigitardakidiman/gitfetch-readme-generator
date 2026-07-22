/**
 * Popular Tech Stack Badges for GitHub Profile READMEs
 */

export const TECH_BADGES = [
  // Languages
  { id: 'typescript', name: 'TypeScript', category: 'Languages', color: '3178C6', logo: 'typescript', logoColor: 'white' },
  { id: 'javascript', name: 'JavaScript', category: 'Languages', color: 'F7DF1E', logo: 'javascript', logoColor: 'black' },
  { id: 'python', name: 'Python', category: 'Languages', color: '3776AB', logo: 'python', logoColor: 'white' },
  { id: 'rust', name: 'Rust', category: 'Languages', color: '000000', logo: 'rust', logoColor: 'white' },
  { id: 'golang', name: 'Go', category: 'Languages', color: '00ADD8', logo: 'go', logoColor: 'white' },
  { id: 'cpp', name: 'C++', category: 'Languages', color: '00599C', logo: 'cplusplus', logoColor: 'white' },
  { id: 'java', name: 'Java', category: 'Languages', color: 'ED8B00', logo: 'openjdk', logoColor: 'white' },
  { id: 'html5', name: 'HTML5', category: 'Languages', color: 'E34F26', logo: 'html5', logoColor: 'white' },
  { id: 'css3', name: 'CSS3', category: 'Languages', color: '1572B6', logo: 'css3', logoColor: 'white' },

  // Frameworks & Libraries
  { id: 'react', name: 'React', category: 'Frameworks', color: '20232A', logo: 'react', logoColor: '61DAFB' },
  { id: 'nextjs', name: 'Next.js', category: 'Frameworks', color: '000000', logo: 'nextdotjs', logoColor: 'white' },
  { id: 'vue', name: 'Vue.js', category: 'Frameworks', color: '4FC08D', logo: 'vuedotjs', logoColor: 'white' },
  { id: 'svelte', name: 'Svelte', category: 'Frameworks', color: 'FF3E00', logo: 'svelte', logoColor: 'white' },
  { id: 'tailwindcss', name: 'TailwindCSS', category: 'Frameworks', color: '38B2AC', logo: 'tailwind-css', logoColor: 'white' },
  { id: 'nodejs', name: 'Node.js', category: 'Frameworks', color: '339933', logo: 'nodedotjs', logoColor: 'white' },
  { id: 'express', name: 'Express', category: 'Frameworks', color: '000000', logo: 'express', logoColor: 'white' },
  { id: 'django', name: 'Django', category: 'Frameworks', color: '092E20', logo: 'django', logoColor: 'white' },

  // Tools & DevOps
  { id: 'docker', name: 'Docker', category: 'Tools', color: '2496ED', logo: 'docker', logoColor: 'white' },
  { id: 'k8s', name: 'Kubernetes', category: 'Tools', color: '326CE5', logo: 'kubernetes', logoColor: 'white' },
  { id: 'aws', name: 'AWS', category: 'Tools', color: '232F3E', logo: 'amazon-aws', logoColor: 'FF9900' },
  { id: 'git', name: 'Git', category: 'Tools', color: 'F05032', logo: 'git', logoColor: 'white' },
  { id: 'linux', name: 'Linux', category: 'Tools', color: 'FCC624', logo: 'linux', logoColor: 'black' },
  { id: 'postgres', name: 'PostgreSQL', category: 'Tools', color: '4169E1', logo: 'postgresql', logoColor: 'white' },
  { id: 'mongodb', name: 'MongoDB', category: 'Tools', color: '47A248', logo: 'mongodb', logoColor: 'white' }
];

export function buildBadgeUrl(badge, style = 'for-the-badge') {
  return `https://img.shields.io/badge/${encodeURIComponent(badge.name)}-${badge.color}?style=${style}&logo=${badge.logo}&logoColor=${badge.logoColor}`;
}

export function buildMarkdownBadges(selectedBadgeIds, style = 'for-the-badge') {
  if (!selectedBadgeIds || selectedBadgeIds.length === 0) return '';
  const badges = TECH_BADGES.filter(b => selectedBadgeIds.includes(b.id));
  return badges.map(b => `![${b.name}](${buildBadgeUrl(b, style)})`).join(' ');
}
