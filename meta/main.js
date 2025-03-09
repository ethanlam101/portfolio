// let data = [];
// let commits = [];
// let xScale;
// let yScale;
// let selectedCommits = [];
// let commitProgress = 100;

// let timeScale = d3.scaleTime([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)], [0, 100]);
// let commitMaxTime = timeScale.invert(commitProgress);

// async function loadData() {
//   data = await d3.csv('loc.csv', (row) => ({
//     ...row,
//     line: Number(row.line),
//     depth: Number(row.depth),
//     length: Number(row.length),
//     date: new Date(row.date + 'T00:00' + row.timezone),
//     datetime: new Date(row.datetime),
//   }));

//   console.log('Loaded data:', data);

//   processCommits();
//   displayStats();
// }

// function processCommits() {
//   commits = d3
//     .groups(data, (d) => d.commit)
//     .map(([commit, lines]) => {
//       let first = lines[0];
//       let { author, date, time, timezone, datetime } = first;

//       let ret = {
//         id: commit,
//         url: 'https://github.com/ethanlam101/portfolio/commit/' + commit,
//         author,
//         date,
//         time,
//         timezone,
//         datetime,
//         hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
//         totalLines: lines.length,
//       };

//       Object.defineProperty(ret, 'lines', {
//         value: lines,
//         enumerable: false,  // Hides the property in logs
//         writable: false,    // Prevents modifications
//         configurable: true  // Allows modification if needed
//       });

//       return ret;
//     });

//   console.log('Processed commits:', commits);
// }

// function displayStats() {
//   const dl = d3.select('#stats').append('dl').attr('class', 'stats');

//   dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
//   dl.append('dd').text(data.length);

//   dl.append('dt').text('Total commits');
//   dl.append('dd').text(commits.length);
// }

// function displaySummaryStats() {
//   document.getElementById("commit-count").textContent = commits.length;
//   document.getElementById("file-count").textContent = new Set(data.map(d => d.file)).size;
//   document.getElementById("total-loc").textContent = data.length;
//   document.getElementById("max-depth").textContent = Math.max(...data.map(d => d.depth), 0);
//   document.getElementById("longest-line").textContent = Math.max(...data.map(d => d.length), 0);
//   document.getElementById("max-lines").textContent = d3.groups(data, d => d.file)
//     .reduce((max, [_, lines]) => Math.max(max, lines.length), 0);
// }

// function createScatterplot() {
//   const width = 800;
//   const height = 500;
//   const margin = { top: 10, right: 10, bottom: 30, left: 40 }; // Increased left margin for better Y-axis visibility

//   // Correct scale ranges with margins included
//   xScale = d3.scaleTime()
//       .domain(d3.extent(commits, (d) => d.datetime))
//       .range([margin.left, width - margin.right])
//       .nice();

//   yScale = d3.scaleLinear()
//       .domain([0, 24])
//       .range([height - margin.bottom, margin.top]);

//   const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
//   const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

//   const svg = d3.select('#chart')
//     .append('svg')
//     .attr('width', width)  // Make SVG larger
//     .attr('height', height)  // Expand SVG
//     .style('overflow', 'visible');

//   const dots = svg.append('g').attr('class', 'dots');

//   dots
//       .selectAll('circle')
//       .data(commits)
//       .join('circle')
//       .attr('cx', (d) => xScale(d.datetime))
//       .attr('cy', (d) => yScale(d.hourFrac))
//       .attr('r', (d) => rScale(d.totalLines))
//       .attr('fill', 'steelblue')
//       .style('fill-opacity', 0.7)
//       .on('mouseenter', function (event, commit) {
//           d3.select(event.currentTarget).classed('selected', true); // give it a corresponding boolean value
//           updateTooltipContent(commit);
//           updateTooltipVisibility(true);
//           updateTooltipPosition(event);
//       })
//       .on('mouseleave', function (event) {
//           d3.select(event.currentTarget).classed('selected', false); // give it a corresponding boolean value
//           updateTooltipContent({});
//           updateTooltipVisibility(false);
//       });

//   const xAxis = d3.axisBottom(xScale);
//   const yAxis = d3.axisLeft(yScale).tickFormat(d => `${String(d).padStart(2, '0')}:00`);
  
//   // Append X axis
//   svg.append('g')
//   .attr('transform', `translate(0, ${height - margin.bottom})`)
//   .call(xAxis)
//   .attr('class', 'x-axis');

//   // Append Y axis
//   svg.append('g')
//   .attr('transform', `translate(${margin.left}, 0)`)
//   .call(yAxis)
//   .attr('class', 'y-axis');

//   // Add gridlines
//   svg.append('g')
//   .attr('class', 'gridlines')
//   .attr('transform', `translate(${margin.left}, 0)`)
//   .call(d3.axisLeft(yScale)
//       .tickSize(-width + margin.left + margin.right)  // Extend gridlines
//       .tickFormat(''));

//   brushSelector();
// }

// function updateTooltipContent(commit) {
//     const link = document.getElementById('commit-link');
//     const date = document.getElementById('commit-date');
  
//     if (Object.keys(commit).length === 0) return;
//     console.log("Hovered commit:", commit);
//     link.href = commit.url;
//     link.textContent = commit.id;
//     date.textContent = commit.datetime?.toLocaleString('en', {
//       dateStyle: 'full',
//     });
// }

// function updateTooltipVisibility(isVisible) {
//     const tooltip = document.getElementById('commit-tooltip');
//     tooltip.classList.toggle('show', isVisible);
// }

// function updateTooltipPosition(event) {
//     const tooltip = document.getElementById('commit-tooltip');
//     tooltip.style.left = `${event.clientX}px`;
//     tooltip.style.top = `${event.clientY}px`;
// }

// function brushSelector() {
//   const svg = d3.select("svg");
//   const margin = { top: 10, right: 10, bottom: 30, left: 40 }; // Same as scatterplot

//   // Create brush
//   const brush = d3.brush()
//     .extent([
//       [margin.left, margin.top],  // 🔹 Start from the actual graph area
//       [800 - margin.right, 500 - margin.bottom] // 🔹 End at the graph area
//     ])
//     .on("start brush end", brushed);

//   // Append brush to the SVG
//   svg.append("g").attr("class", "brush").call(brush);

//   // Raise dots above overlay
//   svg.selectAll(".dots, .overlay ~ *").raise();
// }

// let brushSelection = null;

// function brushed(evt) {
//   let brushSelection = evt.selection;
//   selectedCommits = !brushSelection
//     ? []
//     : commits.filter((commit) => {
//         let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
//         let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
//         let x = xScale(commit.date);
//         let y = yScale(commit.hourFrac);

//         return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
//       });
// }

// function isCommitSelected(commit) {
//   return selectedCommits.includes(commit);
// }

// function updateSelection() {
//   // Update visual state of dots based on selection
//   d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
// }

// function updateSelectionCount() {
//   const selectedCommits = brushSelection
//     ? commits.filter(isCommitSelected)
//     : [];

//   const countElement = document.getElementById('selection-count');
//   countElement.textContent = `${
//     selectedCommits.length || 'No'
//   } commits selected`;

//   return selectedCommits;
// }

// function updateLanguageBreakdown() {
//   const selectedCommits = brushSelection
//     ? commits.filter(isCommitSelected)
//     : [];
//   const container = document.getElementById('language-breakdown');

//   if (selectedCommits.length === 0) {
//     container.innerHTML = '';
//     return;
//   }
//   const requiredCommits = selectedCommits.length ? selectedCommits : commits;
//   const lines = requiredCommits.flatMap((d) => d.lines);

//   // Use d3.rollup to count lines per language
//   const breakdown = d3.rollup(
//     lines,
//     (v) => v.length,
//     (d) => d.type
//   );

//   // Update DOM with breakdown
//   container.innerHTML = '';

//   for (const [language, count] of breakdown) {
//     const proportion = count / lines.length;
//     const formatted = d3.format('.1~%')(proportion);

//     container.innerHTML += `
//             <dt>${language}</dt>
//             <dd>${count} lines (${formatted})</dd>
//         `;
//   }

//   return breakdown;
// }

// document.addEventListener('DOMContentLoaded', async () => {
//     await loadData();
//     createScatterplot();
//     displaySummaryStats();
// });

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let data = [];
let commits = [];

const width = 800;
const height = 500;
let xScale, yScale; // ✅ Make scales global
let brushSelection = null;
let selectedCommits = [];
let filteredCommits = [];
let filteredLines = [];
let commitMaxTime;
let commitProgress = 100;
let timeScale;
let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
let files = [];
const fileScrollContainer = d3.select('#file-scroll-container');
const fileSpacer = d3.select('#file-spacer');
const fileItemsContainer = d3.select('#file-items-container');

document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM fully loaded. Starting data load...");
  await loadData();
  processCommits(); // ✅ Process commits after loading data
  timeScale = d3.scaleTime()
  .domain([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)])
  .range([0, 100]);
  commitMaxTime = timeScale.invert(commitProgress);
  displayStats(); // ✅ Ensure this function is defined before calling
  createScatterplot(); // ✅ Ensure this function is defined before calling
  updateFilesVisualization();
  renderItems(0);
  d3.select('#selectedTime')
  .text(commitMaxTime.toLocaleString());

    document.getElementById("commit-progress").addEventListener("input", function() {
      commitProgress = +this.value; // Convert slider value to number
      commitMaxTime = timeScale.invert(commitProgress);
      document.getElementById("selectedTime").textContent = commitMaxTime.toLocaleString();
      updateFilteredData();
      
      // Now update dependent components:
      updateXScaleDomain();
      displayStats();
      updateScatterplot();
      updateFilesVisualization();
    });
});

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), 
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
    commit: row.commit
  }));

  console.log("CSV file loaded successfully:", data);
}

function processCommits() {
    console.log("Processing commits...");
  
    commits = d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let totalLines = lines.length || 0;
  
      console.log("📌 Checking commit data:", first); // Debugging
  
      return {
        id: commit,
        url: 'https://github.com/ethanlam101/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: totalLines,
        lines: lines.map(l => ({ type: l.type, line: l.line, file: l.file })) // ✅ Ensure `type` is included
      };
    });
  
    console.log("Processed commits:", commits);
  }

function displayStats() {
    console.log("Displaying summary stats...");
    updateFilteredData();
  
    const statsDiv = d3.select("#stats");
    statsDiv.html(""); // Clear previous content
  
    // ✅ Create Summary Container
    const summary = statsDiv.append("div").attr("class", "summary-container");
  
    // ✅ Get calculated statistics
    const totalCommits = filteredCommits.length;
    const totalFiles = new Set(filteredLines.map(d => d.file)).size;
    const totalLOC = d3.sum(filteredLines, d => d.line);
    const maxDepth = d3.max(filteredLines, d => d.depth) || 0;
    const longestLine = d3.max(filteredLines, d => d.length) || 0;
    const maxLines = d3.max(filteredCommits, d => d.totalLines) || 0;
  
    // ✅ Define Summary Stats
    const summaryStats = [
      { label: "Commits", value: totalCommits, id: "total-commits" },
      { label: "Files", value: totalFiles, id: "total-files" },
      { label: "Total LOC", value: totalLOC, id: "total-loc" },
      { label: "Max Depth", value: maxDepth, id: "max-depth" },
      { label: "Longest Line", value: longestLine, id: "longest-line" },
      { label: "Max Lines", value: maxLines, id: "max-lines" },
    ];
  
    // ✅ Append Summary Boxes Dynamically
    summaryStats.forEach((stat) => {
      const box = summary.append("dl").attr("class", "summary-box");
      box.append("dt").text(stat.label);
      box.append("dd").attr("id", stat.id).text(stat.value);
    });
  }

// ✅ Define `createScatterplot()` before calling it
function createScatterplot() { 
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };

  if (commits.length === 0) {
    console.warn("No commit data available for scatterplot.");
    return;
  }

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('overflow', 'visible');

    xScale = d3.scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right]) // ✅ Use usable area
    .nice();
  
  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

    const brush = d3.brush()
  .extent([[0, 0], [width, height]])
  .on("brush end", brushed);

svg.append("g")
  .attr("class", "brush")
  .call(brush);

// ✅ Ensure tooltips work after brushing

  const dots = svg.append('g').attr('class', 'dots');
  dots.selectAll('circle').data(sortedCommits).join('circle');

  dots
  .selectAll("circle")
  .data(commits)
  .join("circle")
  .attr("cx", (d) => xScale(d.datetime))
  .attr("cy", (d) => yScale(d.hourFrac))
  .attr("r", (d) => rScale(d.totalLines))
  .style("fill-opacity", 0.7)
  .attr("fill", "steelblue")
  .on("mouseenter", function (event, commit) {
    d3.select(event.currentTarget).classed('selected', isCommitSelected(commit));
    if (!commit || !commit.id) {
      console.warn("⚠️ Commit data is missing!", commit);
      return;
    }

    d3.select(this).style("fill-opacity", 1);
    updateTooltipContent(commit);
    updateTooltipVisibility(true);
    updateTooltipPosition(event);
  })
  .on("mousemove", function (event) {
    updateTooltipPosition(event);
  })
  .on("mouseleave", function(event, commit) {
    d3.select(event.currentTarget).classed('selected', isCommitSelected(commit));
    d3.select(this).style("fill-opacity", 0.7);
    updateTooltipContent({});
    updateTooltipVisibility(false);
  });
      
      // Update scales with new ranges
      xScale.range([usableArea.left, usableArea.right]);
      yScale.range([usableArea.bottom, usableArea.top]);

      // Create the axes
const xAxis = d3.axisBottom(xScale);
const yAxis = d3
  .axisLeft(yScale)
  .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

// Add X axis
svg
  .append('g')
  .attr('transform', `translate(0, ${usableArea.bottom})`)
  .call(xAxis);

// Add Y axis
svg
  .append('g')
  .attr('transform', `translate(${usableArea.left}, 0)`)
  .call(yAxis);

  const gridlines = svg
  .append('g')
  .attr('class', 'gridlines')
  .attr('transform', `translate(${usableArea.left}, 0)`);

  

// Create gridlines as an axis with no labels and full-width ticks
gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
d3.select("#chart").select("svg").selectAll(".dots").raise();

  console.log("Scatterplot drawn successfully!");
}

function updateTooltipContent(commit) {
    console.log("🟢 Updating tooltip with commit:", commit); // Debugging log
  
    const tooltip = document.getElementById("commit-tooltip");
    const link = document.getElementById("commit-link");
    const date = document.getElementById("commit-date");
    const time = document.getElementById("commit-time");
    const author = document.getElementById("commit-author");
    const linesEdited = document.getElementById("commit-lines");
  
    if (!commit || !commit.id) {
      console.log("⚠️ No commit found, clearing tooltip.");
      link.textContent = "";
      link.href = "#";
      date.textContent = "";
      time.textContent = "";
      author.textContent = "";
      linesEdited.textContent = "";
      return;
    }
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString("en", { dateStyle: "full" });
    time.textContent = commit.time || "Unknown"; // ✅ Ensure time is set
    author.textContent = commit.author || "Unknown"; // ✅ Ensure author is set
    linesEdited.textContent = commit.totalLines || "0"; // ✅ Ensure totalLines is set
  }

  function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById("commit-tooltip");
  
    console.log(`🟢 Tooltip visibility changed: ${isVisible}`); // Debugging log
  
    if (isVisible) {
      tooltip.style.visibility = "visible";
      tooltip.style.opacity = "1"; // ✅ Ensures it's fully visible
      tooltip.style.display = "block"; // ✅ Makes sure it's not hidden
    } else {
      tooltip.style.visibility = "hidden";
      tooltip.style.opacity = "0";
      tooltip.style.display = "none"; // ✅ Ensures it does not take space
    }
  }

  function updateTooltipPosition(event) {
    const tooltip = document.getElementById("commit-tooltip");
  
    console.log(`📍 Moving tooltip to (${event.clientX}, ${event.clientY})`); // Debugging log
  
    tooltip.style.left = `${event.clientX + 10}px`; // Offset to prevent overlap
    tooltip.style.top = `${event.clientY + 10}px`;
  }

  const [minLines, maxLines] = d3.extent(commits, d => d.totalLines) || [1, 100];

  const rScale = d3.scaleSqrt()
    .domain([minLines || 1, maxLines || 100]) 
    .range([2, 30]);
  
    function brushSelector() {
        const svg = document.querySelector('svg');
        d3.select(svg).call(d3.brush());
      }


// Raise dots and everything after overlay
d3.select('#chart').select('svg').selectAll('.dots, .overlay ~ *').raise();

function isCommitSelected(commit) {
  return selectedCommits.includes(commit);
}

  function brushed(evt) {
    let brushSelection = evt.selection;
    selectedCommits = !brushSelection
      ? []
      : commits.filter((commit) => {
          let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
          let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
          let x = xScale(commit.date);
          let y = yScale(commit.hourFrac);
  
          return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
        });
      updateSelection();
  }

  function updateSelection() {
    d3.selectAll("circle")
      .classed("selected", (d) => isCommitSelected(d));
  }
  d3.select('#chart').select('svg').call(d3.brush().on('start brush end', brushed));

  function updateSelectionCount() {
    const countElement = document.getElementById("selection-count");
    countElement.textContent = `${
      selectedCommits.length || "No"
    } commits selected`;
  
    return selectedCommits;
  }

  function updateLanguageBreakdown() {
    console.log("🟢 Updating Language Breakdown...");
  
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const container = document.getElementById("language-breakdown");
  
    if (selectedCommits.length === 0) {
      console.warn("⚠️ No commits selected. Clearing language breakdown.");
      container.innerHTML = "<p>No commits selected</p>";
      return;
    }
  
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    
    // ✅ Extract lines and filter out undefined values
    const lines = requiredCommits.flatMap((d) => d.lines || []);
    const validLines = lines.filter(d => d && d.type); // ✅ Ensure `d.type` exists
  
    if (validLines.length === 0) {
      console.warn("⚠️ No valid lines with types found. Clearing breakdown.");
      container.innerHTML = "<p>No language data available</p>";
      return;
    }
  
    // ✅ Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      validLines, 
      (v) => v.length, 
      (d) => d.type
    );
  
    // ✅ Clear container and append breakdown
    container.innerHTML = "<h3>Language Breakdown</h3>";
  
    for (const [language, count] of breakdown) {
      const proportion = count / validLines.length;
      const formatted = d3.format(".1~%")(proportion);
  
      container.innerHTML += `
        <div>
            <dt>${language}</dt>
            <dd>${count} lines</dd>
            <dd><span>(${formatted})</span></dd>
        </div>
    `;
    }
  }

  function updateFilteredData() {
    filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
    filteredLines = filteredCommits.flatMap(commit => commit.lines || []);
  }

  function updateXScaleDomain() {
    // Ensure the xScale now reflects the filtered commit range:
    xScale.domain(d3.extent(filteredCommits, d => d.datetime)).nice();
    // Optionally update the axis if it's already rendered:
    d3.select("#chart").select("svg").select(".x-axis").call(d3.axisBottom(xScale));
  }

  function updateScatterplot(currentData = filteredCommits) {
    // Update the xScale domain based on filteredCommits:
    xScale.domain(d3.extent(currentData, d => d.datetime)).nice();
  
    // Update the x-axis (make sure you give your x-axis group a class, e.g., "x-axis")
    d3.select("#chart").select("svg").select(".x-axis")
      .call(d3.axisBottom(xScale));
  
    // Rebind data to circles
    const svg = d3.select("#chart").select("svg");
    const dots = svg.select(".dots").selectAll("circle")
      .data(currentData, d => d.id); // use commit id as key
  
    // Remove exiting dots
    dots.exit().remove();
  
    // Update existing dots
    dots.transition().duration(500)
      .attr("cx", d => xScale(d.datetime))
      .attr("cy", d => yScale(d.hourFrac))
      .attr("r", d => rScale(d.totalLines));
  
    // Add new dots
    dots.enter().append("circle")
      .attr("cx", d => xScale(d.datetime))
      .attr("cy", d => yScale(d.hourFrac))
      .attr("r", d => rScale(d.totalLines))
      .style("fill-opacity", 0.7)
      .attr("fill", "steelblue")
      .on("mouseenter", function(event, commit) {
        d3.select(event.currentTarget).classed('selected', isCommitSelected(commit));
        if (!commit || !commit.id) return;
        d3.select(this).style("fill-opacity", 1);
        updateTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
      .on("mousemove", function(event) {
        updateTooltipPosition(event);
      })
      .on("mouseleave", function(event, commit) {
        d3.select(event.currentTarget).classed('selected', isCommitSelected(commit));
        d3.select(this).style("fill-opacity", 0.7);
        updateTooltipContent({});
        updateTooltipVisibility(false);
      });
  }

  function updateFilesVisualization() {
    // Group files based on the current filteredLines
    files = d3.groups(filteredLines, d => d.file)
              .map(([name, lines]) => ({ name, lines }));
    
    // Sort files in descending order by number of lines
    files = d3.sort(files, d => -d.lines.length);
    
    // Clear any previous rendering:
    d3.select('.files').selectAll('div').remove();
    
    // Bind our data to new divs inside the <dl class="files"> container.
    const filesContainer = d3.select('.files')
      .selectAll('div')
      .data(files)
      .enter()
      .append('div');
    
    // Append the <dt> element with a <code> element (and optionally a <small> for the line count).
    filesContainer.append('dt')
      .html(d => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);
    
    // Append the <dd> element and then create one <div class="line"> per line,
    // setting the background color based on the line's technology type.
    filesContainer.append('dd')
      .selectAll('div')
      .data(d => d.lines)
      .enter()
      .append('div')
      .attr('class', 'line')
      .style('background', d => fileTypeColors(d.type));


      // Select the new scrolly elements
// Set the spacer height
fileSpacer.style('height', `${fileTotalHeight}px`);
      renderFileItems(0);
  }

  let NUM_ITEMS = 100; // Ideally, let this value be the length of your commit history
let ITEM_HEIGHT = 100; // Feel free to change
let VISIBLE_COUNT = 5; // Feel free to change as well
let totalHeight = NUM_ITEMS * ITEM_HEIGHT;
const scrollContainer = d3.select('#scroll-container');
const spacer = d3.select('#spacer');
spacer.style('height', `${totalHeight}px`);
const itemsContainer = d3.select('#items-container');
scrollContainer.on('scroll', () => {
  const scrollTop = scrollContainer.property('scrollTop');
  let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
  startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
  renderItems(startIndex);
});

function renderItems(startIndex) {
  // Clear previous commit items
  itemsContainer.selectAll('div').remove();

  const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
  let newCommitSlice = commits.slice(startIndex, endIndex);

  // Bind the commit slice to div elements and generate dummy narrative for each
  itemsContainer.selectAll('div')
    .data(newCommitSlice)
    .enter()
    .append('div')
    .attr('class', 'item')
    .html((commit, index) => {
      return `<p>
        On ${new Date(commit.datetime).toLocaleString("en", {dateStyle: "full", timeStyle: "short"})}, I made 
        <a href="${commit.url}" target="_blank">
          ${index > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'}
        </a>. I edited ${commit.totalLines} lines across 
        ${d3.rollups(commit.lines, d => d.length, d => d.file).length} files. Then I looked over all I had made, and I saw that it was very good.
      </p>`;
    })
    .style('position', 'absolute')
    // Position each commit item relative to its index in the visible slice.
    .style('top', (_, idx) => `${idx * ITEM_HEIGHT}px`)
    .style('width', '100%');
}

let NUM_FILE_ITEMS = files.length;   // total file count
let FILE_ITEM_HEIGHT = 80;           // Adjust this based on your narrative text size
let FILE_VISIBLE_COUNT = 10;         // Number of file items visible at once
let fileTotalHeight = NUM_FILE_ITEMS * FILE_ITEM_HEIGHT;

// Attach a scroll event listener to update visible file items
fileScrollContainer.on('scroll', () => {
  const scrollTop = fileScrollContainer.property('scrollTop');
  const startIndex = Math.floor(scrollTop / FILE_ITEM_HEIGHT);
  const safeIndex = Math.max(0, Math.min(startIndex, files.length - FILE_VISIBLE_COUNT));
  
  // Store current scroll position
  d3.select('#file-scroll-container').classed('scrolling', true);
  
  renderFileItems(safeIndex);
});

// Function to render file items based on scroll position
function renderFileItems(startIndex) {
  // Clear previous file items
  fileItemsContainer.selectAll('div').remove();
  
  const endIndex = Math.min(startIndex + FILE_VISIBLE_COUNT, files.length);
  let fileSlice = files.slice(startIndex, endIndex);
  const activeFiles = fileSlice.map(d => d.name);
  
  // Bind data to new divs and create a placeholder narrative
  fileItemsContainer.selectAll('div')
    .data(fileSlice)
    .enter()
    .append('div')
    .attr('class', 'file-item')
    .style('top', (_, idx) => `${idx * FILE_ITEM_HEIGHT}px`)
    .html((d, i) => {
      // Temporary narrative: customize this with a meaningful story
      return `<p>
        In file <strong>${d.name}</strong>, I edited ${d.lines.length} lines.
        ${i === 0 ? 'This is my first file change.' : 'Another update to improve functionality.'}
      </p>`;
    });
    const fileFilteredCommits = filteredCommits.filter(commit => 
      // Preserve original commit structure including all lines
      commit.lines.some(line => 
        activeFiles.includes(line.file) // Now using actual file property
      )
    );
    updateScatterplot(fileFilteredCommits.length > 0 ? fileFilteredCommits : filteredCommits);
}