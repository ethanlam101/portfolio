console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'resume/', title: 'Resume' },
  { url: 'contact/', title: 'Contact' }
];

const ARE_WE_HOME = document.documentElement.classList.contains('home');

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  nav.append(a);

  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );

  a.toggleAttribute('target', a.host !== location.host);

  if (a.target) {
    a.target = '_blank';
  }

  nav.append(a);
}

// Insert the color scheme selector
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select id="theme-selector">
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

const select = document.querySelector('#theme-selector');

// Function to apply the color scheme
function applyColorScheme(scheme) {
  document.documentElement.style.setProperty('color-scheme', scheme);
}

// Check if color scheme is stored in localStorage
const savedScheme = localStorage.getItem('colorScheme');
if (savedScheme) {
  applyColorScheme(savedScheme);
  select.value = savedScheme;
}

// Event listener for changes in the select dropdown
select.addEventListener('input', function (event) {
  const selectedScheme = event.target.value;
  applyColorScheme(selectedScheme);
  localStorage.setItem('colorScheme', selectedScheme);
  console.log('Color scheme changed to', selectedScheme);
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');

  if (form) {
      form.addEventListener('submit', (event) => {
          event.preventDefault(); // Prevent default form submission

          const data = new FormData(form);
          let params = new URLSearchParams();

          for (let [name, value] of data) {
              params.append(name, encodeURIComponent(value));
          }

          // Build the mailto URL with properly encoded parameters
          const mailtoURL = `${form.action}?${params.toString()}`;

          // Open the mail client with the generated mailto URL
          location.href = mailtoURL;
      });
  }
});

export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const data = await response.json();
      return data;

  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';

  project.forEach(project => {
        const article = document.createElement('article');

        // Ensure valid heading level
        const validHeadingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        const headingTag = validHeadingLevels.includes(headingLevel) ? headingLevel : 'h2';

        article.innerHTML = `
            <${headingTag}>${project.title}</${headingTag}>
            <img src="${project.image || 'default.png'}" alt="${project.title}">
            <p>${project.description || 'No description available.'}</p>
        `;
        article.classList.add("centered-content");

        containerElement.appendChild(article);
    });
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

