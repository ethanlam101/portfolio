import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let data = [];
let commits = [];
let xScale;
let yScale;

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  console.log('Loaded data:', data);

  processCommits();
  displayStats();
}

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      let ret = {
        id: commit,
        url: 'https://github.com/ethanlam101/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false,  // Hides the property in logs
        writable: false,    // Prevents modifications
        configurable: true  // Allows modification if needed
      });

      return ret;
    });

  console.log('Processed commits:', commits);
}

function displayStats() {
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);
}

function calculateStats() {
    // 1️⃣ Number of files in the codebase
    const numFiles = new Set(data.map(d => d.file)).size;
  
    // 2️⃣ Maximum file length (in lines) & Longest file
    const fileGroups = d3.groups(data, d => d.file);
    const longestFile = fileGroups.reduce((max, [file, lines]) => 
      lines.length > max.length ? { file, length: lines.length } : max, 
      { file: null, length: 0 }
    );
  
    // 3️⃣ Average line length (in characters)
    const totalLineLength = data.reduce((sum, d) => sum + d.length, 0);
    const avgLineLength = totalLineLength / data.length || 0;
  
    // 4️⃣ Time of day most work is done (morning, afternoon, evening, night)
    const timeCategories = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    data.forEach(d => {
      const hour = new Date(d.datetime).getHours();
      if (hour >= 6 && hour < 12) timeCategories.morning++;
      else if (hour >= 12 && hour < 18) timeCategories.afternoon++;
      else if (hour >= 18 && hour < 24) timeCategories.evening++;
      else timeCategories.night++;
    });
    const mostWorkTime = Object.entries(timeCategories).reduce((max, entry) => 
      entry[1] > max[1] ? entry : max, ["none", 0])[0];
  
    console.log("📂 Number of Files:", numFiles);
    console.log("📏 Longest File:", longestFile.file, `(${longestFile.length} lines)`);
    console.log("🔠 Average Line Length:", avgLineLength.toFixed(2), "characters");
    console.log("⏳ Most Work Done During:", mostWorkTime);
  }

function createScatterplot() {
  const width = 800;
  const height = 500;
  const margin = { top: 10, right: 10, bottom: 30, left: 40 }; // Increased left margin for better Y-axis visibility

  // Correct scale ranges with margins included
  xScale = d3.scaleTime()
      .domain(d3.extent(commits, (d) => d.datetime))
      .range([margin.left, width - margin.right])
      .nice();

  yScale = d3.scaleLinear()
      .domain([0, 24])
      .range([height - margin.bottom, margin.top]);

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width)  // Make SVG larger
    .attr('height', height)  // Expand SVG
    .style('overflow', 'visible');

  const dots = svg.append('g').attr('class', 'dots');

  dots
      .selectAll('circle')
      .data(commits)
      .join('circle')
      .attr('cx', (d) => xScale(d.datetime))
      .attr('cy', (d) => yScale(d.hourFrac))
      .attr('r', (d) => rScale(d.totalLines))
      .attr('fill', 'steelblue')
      .style('fill-opacity', 0.7)
      .on('mouseenter', function (event, commit) {
          d3.select(this).style('fill-opacity', 1);
          updateTooltipContent(commit);
          updateTooltipVisibility(true);
          updateTooltipPosition(event);
      })
      .on('mouseleave', function () {
          d3.select(this).style('fill-opacity', 0.7);
          updateTooltipContent({});
          updateTooltipVisibility(false);
      });

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat(d => `${String(d).padStart(2, '0')}:00`);
  
  // Append X axis
  svg.append('g')
  .attr('transform', `translate(0, ${height - margin.bottom})`)
  .call(xAxis)
  .attr('class', 'x-axis');

  // Append Y axis
  svg.append('g')
  .attr('transform', `translate(${margin.left}, 0)`)
  .call(yAxis)
  .attr('class', 'y-axis');

  // Add gridlines
  svg.append('g')
  .attr('class', 'gridlines')
  .attr('transform', `translate(${margin.left}, 0)`)
  .call(d3.axisLeft(yScale)
      .tickSize(-width + margin.left + margin.right)  // Extend gridlines
      .tickFormat(''));

  brushSelector();
}

function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
}

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.classList.toggle('show', isVisible);
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

function brushSelector() {
  const svg = d3.select("svg");
  const margin = { top: 10, right: 10, bottom: 30, left: 40 }; // Same as scatterplot

  // Create brush
  const brush = d3.brush()
    .extent([
      [margin.left, margin.top],  // 🔹 Start from the actual graph area
      [800 - margin.right, 500 - margin.bottom] // 🔹 End at the graph area
    ])
    .on("start brush end", brushed);

  // Append brush to the SVG
  svg.append("g").attr("class", "brush").call(brush);

  // Raise dots above overlay
  svg.selectAll(".dots, .overlay ~ *").raise();
}

let brushSelection = null;

function brushed(event) {
  brushSelection = event.selection;
  updateSelection();
  updateLanguageBreakdown();  
  updateSelectionCount();
}

function isCommitSelected(commit) {
  if (!brushSelection) {
    return false;
  }
  
  const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
  const max = { x: brushSelection[1][0], y: brushSelection[1][1] };

  const x = xScale(commit.date);
  const y = yScale(commit.hourFrac);

  return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];

  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function updateLanguageBreakdown() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }

  return breakdown;
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    createScatterplot();
    calculateStats();
});

