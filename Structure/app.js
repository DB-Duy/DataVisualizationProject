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

  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
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
