/**
 * GitHub API Helper Module
 * Fetches user profile, repository statistics, and calculates profile metrics.
 */

export async function fetchGitHubUser(username) {
  if (!username || !username.trim()) {
    throw new Error('Please enter a valid GitHub username.');
  }

  const cleanUser = username.trim().replace(/^@/, '');
  const userUrl = `https://api.github.com/users/${cleanUser}`;

  try {
    const res = await fetch(userUrl);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`GitHub user "${cleanUser}" not found.`);
      }
      throw new Error(`GitHub API error: ${res.statusText}`);
    }

    const data = await res.json();

    // Fetch user public repos for star count calculation (optional/best effort)
    let totalStars = 0;
    try {
      const reposRes = await fetch(`https://api.github.com/users/${cleanUser}/repos?per_page=100&sort=updated`);
      if (reposRes.ok) {
        const repos = await reposRes.json();
        totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
      }
    } catch (e) {
      console.warn('Could not fetch repo stats:', e);
    }

    // Calculate account age / uptime
    const creationDate = new Date(data.created_at);
    const now = new Date();
    const diffMs = now - creationDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const uptimeStr = `${years} years, ${months} months, ${diffDays % 30} days`;

    return {
      username: data.login,
      name: data.name || data.login,
      avatarUrl: data.avatar_url,
      bio: data.bio || '',
      company: data.company || 'Freelance / Open Source',
      location: data.location || 'Earth',
      publicRepos: data.public_repos,
      followers: data.followers,
      following: data.following,
      stars: totalStars,
      uptime: uptimeStr,
      blog: data.blog || '',
      twitter: data.twitter_username || ''
    };
  } catch (err) {
    throw err;
  }
}
