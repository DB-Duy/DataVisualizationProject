// Get the selected country from the query parameter
const urlParams = new URLSearchParams(window.location.search);
const country = urlParams.get("country").trim().toLowerCase();

// Generate dynamic content based on the selected country
d3.csv("http://127.0.0.1:8080/Tools/CountrySummary.csv").then((data) => {
  const countryData = data.filter(
    (d) => d["CountryCode"].trim().toLowerCase() == country
  );
  const contentElement = document.getElementById("content");
  contentElement.innerHTML = countryData[0]["Summary"];
});

d3.csv("http://127.0.0.1:8080/Inflation_Annual_Filtered.csv").then((data) => {
  DrawGraph(data);
});

const DrawGraph = (data) => {
  const countryData = data.filter(
    (d) => d["Country Code"].trim().toLowerCase() == country
  )[0];
  d3.select("#countryName").text(countryData["Country"]);
  d3.select("title").text(countryData["Country"]);
  // console.log(countryData);

  const getYearRange = () => {
    let range = [];
    Object.keys(countryData).forEach((d) => {
      if (!isNaN(d)) {
        range.push(parseInt(d));
      }
    });
    return [d3.min(range), d3.max(range)];
  };

  const yearRange = getYearRange();

  let inflationRates = [];
  Object.keys(countryData).forEach((d) => {
    if (!isNaN(d)) {
      inflationRates.push([d, countryData[d]]);
    }
  });
  // console.log(inflationRates);

  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3
    .select("#canvas")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3.scaleLinear().domain(yearRange).range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([
      d3.min(inflationRates, (d) => d[1]) < 0
        ? d3.min(inflationRates, (d) => d[1])
        : 0,
      d3.max(inflationRates, (d) => d[1]),
    ])
    .range([height, 0]);

  const xAxis = d3.axisBottom(x).ticks(null, ".0f");

  const yAxis = d3.axisLeft(y);

  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g").call(yAxis);
  svg
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + "," + (height + margin.top + 20) + ")"
    )
    .style("text-anchor", "middle")
    .text("Year");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Inflation Rate");

  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background-color", "rgba(0, 0, 0, 0.8)")
    .style("color", "#fff")
    .style("padding", "8px")
    .style("font-size", "12px")
    .style("border-radius", "4px")
    .style("opacity", 0);

  svg
    .selectAll(".dot")
    .data(inflationRates)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => x(d[0]))
    .attr("cy", (d) => y(d[1]))
    .attr("r", 4)
    .attr("fill", "steelblue")
    .on("mouseover", (event, d) => {
      // Show the tooltip
      tooltip.style("opacity", 1);
      tooltip
        .html(`Year: ${d[0]}<br>Inflation Rate: ${d[1]}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mouseout", () => {
      // Hide the tooltip
      tooltip.style("opacity", 0);
    });

  const line = d3
    .line()
    .x((d) => x(d[0]))
    .y((d) => y(d[1]));
  svg
    .append("path")
    .datum(inflationRates)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);
};
