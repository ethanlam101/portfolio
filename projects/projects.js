import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projectsContainer = document.querySelector('.projects');
let projects = await fetchJSON('../lib/projects.json');
renderProjects(projects, projectsContainer, 'h2');
let selectedIndex = -1;

renderPieChart(projects);

// Search bar element
let searchInput = document.querySelector('.searchBar');

// Function to filter projects based on search input
function filterProjects(query) {
  return projects.filter(project => 
    project.title.toLowerCase().includes(query.toLowerCase())
  );
}

// Function to render the pie chart
function renderPieChart(projectsGiven) {
  if (!projectsGiven || projectsGiven.length === 0) {
    d3.select('svg').selectAll('path').remove();
    d3.select('.legend').selectAll('li').remove();
    return;
  }

  // Recalculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  // Recalculate data for pie chart
  let newData = newRolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  // Recalculate slice generator, arc data, and arcs
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  let svg = d3.select('svg');

  // Clear existing paths and legends before re-rendering
  svg.selectAll('path').remove();
  d3.select('.legend').selectAll('li').remove();

  // Append new paths (slices)
  svg
    .selectAll('path')
    .data(newArcData)
    .enter()
    .append('path')
    .attr('d', newArcGenerator)
    .attr('fill', (d, i) => (selectedIndex === i ? "oklch(60% 45% 0)" : colors(i))) // Highlight selected
    .attr('transform', 'translate(0,0)')
    .on('click', (event, d) => {
      let i = newArcData.indexOf(d);
      selectedIndex = selectedIndex === i ? -1 : i; // Toggle selection
      
      if (selectedIndex === -1) {
        renderProjects(projectsGiven, projectsContainer, 'h2');
      } else {
        let selectedYear = newData[selectedIndex].label;
        let filteredProjects = projectsGiven.filter(proj => proj.year === selectedYear);
        renderProjects(filteredProjects, projectsContainer, 'h2');
      }

      renderPieChart(projectsGiven); // Re-render chart to apply selection
    })
    .attr('class', (_, i) => (i === selectedIndex ? "selected" : ""));

  // Append new legend items with click-to-select/deselect functionality
  let legend = d3.select('.legend');
  let legendItems = legend
    .selectAll('li')
    .data(newData)
    .enter()
    .append('li')
    .attr('class', (_, i) => (i === selectedIndex ? "selected" : "")) // Highlight selected legend item
    .attr('style', (d, i) => `--color:${colors(i)}`)
    .html((d) => `<span class="swatch" style="background:${colors(newData.indexOf(d))}"></span> ${d.label} <em>(${d.value})</em>`)
    .on('click', (event, d) => {
      let i = newData.indexOf(d);
      selectedIndex = selectedIndex === i ? -1 : i; // Toggle selection

      // Update slice colors dynamically instead of re-rendering everything
      slices.attr('fill', (d, i) => (i === selectedIndex ? "oklch(60% 45% 0)" : colors(i)));

      renderProjects(selectedIndex === -1 ? projectsGiven : projectsGiven.filter(proj => proj.year === newData[selectedIndex].label), projectsContainer, 'h2');
    });
}

// Search event listener
searchInput.addEventListener('change', (event) => {
  let query = event.target.value;
  let filteredProjects = filterProjects(query);
  
  // Re-render projects and pie chart when event triggers
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});
