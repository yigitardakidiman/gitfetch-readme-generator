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

    let totalStars = 0;
    let languages = {};
    try {
      const reposRes = await fetch(`https://api.github.com/users/${cleanUser}/repos?per_page=100&sort=updated`);
      if (reposRes.ok) {
        const repos = await reposRes.json();
        totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        languages = repos.reduce((acc, repo) => {
          if (repo.language) {
            acc[repo.language] = (acc[repo.language] || 0) + 1;
          }

          return acc;
        }, {});
      }
    } catch (e) {
      console.warn('Could not fetch repo stats:', e);
    }

    const topLanguages = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([language]) => language);

    const creationDate = new Date(data.created_at);
    const now = new Date();
    const diffMs = now - creationDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const uptimeStr = `${years} years, ${months} months, ${diffDays % 30} days`;

    try {
      const socialAccountsRes = await fetch(`https://api.github.com/users/${cleanUser}/social_accounts`);
      if (socialAccountsRes.ok) {
        const socialAccounts = await socialAccountsRes.json();
        socialAccounts.forEach(account => {
          if (account.provider === 'linkedin') {
            const match = account.url?.match(/(\/in\/[^/?#]+)/);
            data.linkedin_username = match ? match[1] : account.url || '';
          }
        });
      }
    } catch (e) {
      console.warn('Could not fetch social accounts:', e);
    }

    return {
      username: data.login,
      name: data.name || data.login,
      avatarUrl: data.avatar_url,
      bio: data.bio || '',
      languages: topLanguages.length > 0 ? topLanguages.join(', ') : '',
      company: data.company || 'Freelance / Open Source',
      location: data.location || 'Earth',
      publicRepos: data.public_repos,
      followers: data.followers,
      following: data.following,
      stars: totalStars,
      uptime: uptimeStr,
      email: data.email || '',  
      blog: data.blog || '',
      twitter: data.twitter_username || '',
      linkedin: data.linkedin_username || ''
    };
  } catch (err) {
    throw err;
  }
}
