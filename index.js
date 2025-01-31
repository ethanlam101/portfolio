import { fetchJSON, renderProjects, fetchGitHubData} from './global.js';

const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);

const projectsContainer = document.querySelector('.projects');

renderProjects(latestProjects, projectsContainer, 'h2');

const githubData = await fetchGitHubData('ethanlam101');

const profileStats = document.querySelector('#profile-stats');

if (profileStats) {
    profileStats.innerHTML = `
          <dl>
            <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers:</dt><dd>${githubData.followers}</dd>
            <dt>Following:</dt><dd>${githubData.following}</dd>
          </dl>
      `;
  }

if (githubData) {
profileStats.innerHTML = `
    <h2>My GitHub Stats</h2>
    <div class="stats-grid">
        <div class="stat">
            <span class="label">FOLLOWERS</span>
            <span class="value">${githubData.followers}</span>
        </div>
        <div class="stat">
            <span class="label">FOLLOWING</span>
            <span class="value">${githubData.following}</span>
        </div>
        <div class="stat">
            <span class="label">PUBLIC REPOS</span>
            <span class="value">${githubData.public_repos}</span>
        </div>
        <div class="stat">
            <span class="label">PUBLIC GISTS</span>
            <span class="value">${githubData.public_gists}</span>
        </div>
    </div>
`;
} else {
    profileStats.innerHTML = "<p>Unable to load GitHub stats.</p>";
}