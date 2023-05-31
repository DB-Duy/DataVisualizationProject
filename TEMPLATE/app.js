const urlParams = new URLSearchParams(window.location.search);
const country = urlParams.get("country").trim().toLowerCase();

function formatNumber(number) {
  const suffixes = ["", " k", " M", " B", " T"]; // Add more suffixes as needed
  const suffixNum = Math.floor(("" + number).length / 3);
  let shortNumber = parseFloat(
    (suffixNum != 0 ? number / Math.pow(1000, suffixNum) : number).toPrecision(
      2
    )
  );
  if (shortNumber % 1 !== 0) {
    shortNumber = shortNumber.toFixed(1);
  }
  return shortNumber + suffixes[suffixNum];
}
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
d3.csv("http://127.0.0.1:8080/Tools/CountrySummary.csv").then((data) => {
  const countryData = data.filter(
    (d) => d["CountryCode"].trim().toLowerCase() == country
  );
  const contentElement = document.getElementById("country-summary");
  contentElement.innerHTML = countryData[0]["Summary"];
});

d3.csv("http://127.0.0.1:8080/Inflation_Annual_Filtered.csv").then((data) => {
  DrawGraph(data);
});

const PopulateFields = (d) => {
  // custom fields : country-name, region-name, country-map, latest-rate, population, currency, currency-value
  d3.select("#country-name").html(d["Country"]);
  d3.csv(
    "http://127.0.0.1:8080/Tools/CWON2021%20Country%20Tool%20-%20Full%20Dataset%20-%20Filtered.csv"
  ).then((data) => {
    const margin = { top: 20, right: 20, bottom: 70, left: 50 };
    const width = 550 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;
    const countryData = data.filter(
      (d) => d["wb_code"].trim().toLowerCase() == country
    );
    d3.csv(
      "http://127.0.0.1:8080/Tools/country-code-to-currency-code-mapping.csv"
    ).then((currencyData) => {
      const filteredCurrencyData = currencyData.filter(
        (c) => c["Country"].toLowerCase() === d["Country"].toLowerCase()
      )[0];
      const currency = [
        filteredCurrencyData["Code"],
        filteredCurrencyData["Currency"],
      ];
      d3.csv("http://127.0.0.1:8080/Tools/ExhangeRates.csv").then((rates) => {
        const countryRates = rates.filter(
          (c) => c["Country Name"].toLowerCase() === d["Country"].toLowerCase()
        )[0];
        d3.select("#currency-value").html(
          `${countryRates["2022"]} ${currency[0]} (${currency[1]})`
        );
      });
    });
    const latestData = countryData[countryData.length - 1];
    console.log(latestData);
    d3.select("#region-name").html(latestData["wb_region"]);
    d3.select("#population").html(latestData["pop"]);
    d3.select("#total-wealth").html(
      latestData["totwealth"] == ".."
        ? "#NA"
        : "$" + formatNumber(Number(latestData["totwealth"]))
    );
    d3.select("#total-wealth-info").html(
      latestData["wb_income"].includes("OECD")
        ? "Not in the OECD"
        : latestData["wb_income"]
    );
    console.log(latestData);
    const svg = d3
      .select("#stackedBar")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const entry = [
      // { category: "Total wealth", value: +latestData["totwealth"] },
      {
        category: "Produced capital",
        value: +latestData["pk"],
        desc: "Produced Capital: Refers to the physical assets created by humans for the purpose of production and economic activity. It includes infrastructure, machinery, equipment, and other tangible resources that contribute to economic output.",
      },
      {
        category: "Human capital",
        value: +latestData["hc"],
        desc: "Human Capital: Represents the knowledge, skills, abilities, and health of individuals within a population. It encompasses education, training, experience, and overall well-being, which are considered valuable resources for economic development and productivity.",
      },
      {
        category: "Natural capital",
        value: +latestData["nk"],
        desc: "Natural Capital: Refers to the Earth's natural resources, ecosystems, and environmental assets that provide various benefits and services to humans. It includes land, forests, water bodies, minerals, biodiversity, and other elements that contribute to the sustenance of life and support economic activities.",
      },
      {
        category: "Net foreign assets",
        value: +latestData["nfa"],
        desc: "Net Foreign Assets: Represents the difference between a country's external assets and liabilities. It reflects the net ownership of foreign assets by residents of a country and indicates the country's financial position in relation to the rest of the world. Positive net foreign assets imply that the country owns more assets abroad than it owes to foreign entities, while negative net foreign assets indicate the opposite.",
      },
    ];
    const colorScale = d3
      .scaleOrdinal()
      .domain([
        "Produced Capital",
        "Human Capital",
        "Natural Capital",
        "Net Foreign Assets",
      ])
      .range(["#FFB900", "#FF7733", "#E34F6F", "#8A6FAC"]);

    const xScale = d3
      .scaleBand()
      .domain(entry.map((d) => d.category))
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(entry, (d) => Math.abs(d.value))])
      .range([height - margin.bottom, margin.top]);

    // const bars = svg
    //   .selectAll("rect")
    //   .data(entry)
    //   .join("rect")
    //   .attr("x", (d) => xScale(d.category))
    //   .attr("y", (d) => (d.value >= 0 ? yScale(d.value) : yScale(0)))
    //   .attr("width", xScale.bandwidth())
    //   .transition()
    //   .attr("height", (d) => Math.abs(yScale(d.value) - yScale(0)))
    //   .attr("fill", (d, i) => colorScale(i));
    const bars = svg
      .selectAll("rect")
      .data(entry)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.category))
      .attr("y", height)
      .attr("width", xScale.bandwidth())
      .attr("height", 0)
      .style("fill", (d, i) => colorScale(i))
      .on("mouseover", function (event, d) {
        tooltip
          .style("opacity", 1)
          .style("background-color", "rgba(0, 0, 0, 0.8)")
          .style("color", "#fff")
          .style("padding", "8px")
          .style("font-size", "12px")
          .style("border-radius", "4px")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
          .html(`${d.desc}`);
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr("y", (d) => (d.value >= 0 ? yScale(d.value) : yScale(0)))
      .attr("height", (d) => Math.abs(yScale(d.value) - yScale(0)));

    svg
      .selectAll("text")
      .data(entry)
      .join("text")
      .attr("x", (d) => xScale(d.category) + xScale.bandwidth() / 2)
      .attr("y", (d) => (d.value >= 0 ? yScale(d.value) - 5 : yScale(0) + 60))
      .attr("text-anchor", "middle")
      .text((d) => (isNaN(d.value) ? "No Data" : formatNumber(d.value)));

    const legendData = [
      { label: "Produced Capital", color: colorScale("Produced Capital") },
      { label: "Human Capital", color: colorScale("Human Capital") },
      { label: "Natural Capital", color: colorScale("Natural Capital") },
      { label: "Net Foreign Assets", color: colorScale("Net Foreign Assets") },
    ];

    const legend = d3
      .select("#legend-box")
      .append("svg")
      .attr("width", 200)
      .attr("height", 150)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const legendRects = legend
      .selectAll("rect")
      .data(legendData)
      .enter()
      .append("rect")
      .attr("x", 10)
      .attr("y", (d, i) => i * 30)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", (d) => d.color);

    const legendLabels = legend
      .selectAll("text")
      .data(legendData)
      .enter()
      .append("text")
      .text((d) => d.label)
      .attr("x", 40)
      .attr("y", (d, i) => i * 30 + 15)
      .attr("font-size", 14)
      .attr("alignment-baseline", "middle");

    DrawGraphPerCapita(data);
  });
};

const DrawGraphPerCapita = (data) => {
  const countryData = data.filter(
    (d) => d["wb_code"].trim().toLowerCase() == country
  );
  const margin = { top: 20, right: 200, bottom: 50, left: 100 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  const svg = d3
    .select("#per-capita")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  const xScale = d3.scaleBand().range([0, width]).padding(0.1);

  const yScale = d3.scaleLinear().range([height, 0]);

  const colorScale = d3
    .scaleOrdinal()
    .range(["#FFB900", "#FF7733", "#E34F6F", "#8A6FAC", "#a05d56"]);
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).ticks(5);
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`);

  svg.append("g").attr("class", "y-axis");
  const select = d3.select("#year-select");
  for (let i = 1; i <= countryData.length; i++) {
    select.append("option").attr("value", i).text(i);
  }
  svg
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background-color", "rgba(0, 0, 0, 0.8)")
    .style("color", "#fff")
    .style("padding", "8px")
    .style("font-size", "12px")
    .style("border-radius", "4px")
    .style("opacity", 0);
  const keys = [
    "producedCapital",
    "renewableNaturalCapital",
    "nonRenewableNaturalCapital",
    "humanCapital",
    "netForeignAssets",
  ];
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width}, 20)`);

  // Add legend items
  const legendItems = legend
    .selectAll(".legend-item")
    .data(keys)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);

  // Add colored rectangles for each legend item
  legendItems
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", (d, i) => colorScale(i));

  // Add labels for each legend item
  legendItems
    .append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text((d) => d)
    .style("font-size", "12px");

  select.on("change", updateChart);

  function updateChart() {
    const numYearsToShow = +select.property("value");
    const filteredData = countryData.slice(-numYearsToShow).map((d) => ({
      year: isNaN(+d["year"]) ? 0 : +d["year"],
      producedCapital: isNaN(+d["pk"]) ? 0 : +d["pk"],
      renewableNaturalCapital: isNaN(+d["renew"]) ? 0 : +d["renew"],
      nonRenewableNaturalCapital: isNaN(+d["nk"] - +d["renew"])
        ? 0
        : +d["nk"] - +d["renew"],
      humanCapital: isNaN(+d["hc"]) ? 0 : +d["hc"],
      netForeignAssets: isNaN(+d["nfa"]) ? 0 : +d["nfa"],
    }));
    console.log(filteredData);

    xScale.domain(filteredData.map((d) => d.year));
    yScale.domain([
      0,
      d3.max(
        filteredData,
        (d) =>
          d.producedCapital +
          d.renewableNaturalCapital +
          d.nonRenewableNaturalCapital +
          d.humanCapital
      ),
    ]);
    svg.selectAll(".bar").remove();

    svg.select(".x-axis").transition().duration(500).call(xAxis);

    svg.select(".y-axis").transition().duration(500).call(yAxis);

    const stack = d3.stack().keys(keys);

    const stackedData = stack(filteredData);

    const bars = svg.selectAll(".bar").data(stackedData);

    bars
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("fill", (d) => colorScale(d.key))
      .merge(bars)
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .on("mouseover", (event, d) => {
        const selectedData = d3.select(event.currentTarget).datum().data;
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(d[1] - d[0])
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY}px`);
      })
      .on("mouseout", hideTooltip)
      .attr("x", (d) => xScale(d.data.year))
      .attr("y", (d) => yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .transition()
      .duration(100)
      .attr("height", (d) => Math.abs(yScale(d[0]) - yScale(d[1])));

    // Add tooltips to the bars
    function showTooltip(event, text) {
      tooltip
        .style("opacity", 1)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px")
        .html(text);
    }

    // Function to hide the tooltip
    function hideTooltip() {
      tooltip.style("opacity", 0);
    }

    // Function to get the category label based on the key
    function getCategoryLabel(key) {
      switch (key) {
        case "producedCapital":
          return "Produced Capital";
        case "renewableNaturalCapital":
          return "Renewable Natural Capital";
        case "nonRenewableNaturalCapital":
          return "Non-Renewable Natural Capital";
        case "humanCapital":
          return "Human Capital";
        case "netForeignAssets":
          return "Net Foreign Assets";
        default:
          return "";
      }
    }
  }
  // Initialize the chart
  updateChart();
};
const DrawGraph = (data) => {
  const countryData = data.filter(
    (d) => d["Country Code"].trim().toLowerCase() == country
  )[0];
  d3.select("#countryName").text(countryData["Country"]);
  PopulateFields(countryData);
  d3.select("title").text(countryData["Country"]);

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

  d3.select("#latest-rate").html(inflationRates[inflationRates.length - 1][1]);

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
      d3.min(inflationRates, (d) => +d[1]) < 0
        ? d3.min(inflationRates, (d) => +d[1])
        : 0,
      d3.max(inflationRates, (d) => +d[1]),
    ])
    .range([height, 0]);

  const xAxis = d3.axisBottom(x).ticks(null, ".0f");

  const yAxis = d3.axisLeft(y);

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + height + ")");

  svg.append("g").attr("id", "y-axis");
  svg.select("#x-axis").transition().duration(500).call(xAxis);

  svg.select("#y-axis").transition().duration(500).call(yAxis);
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

  const line = d3
    .line()
    .x((d) => x(d[0]))
    .y((d) => y(d[1]))
    .curve(d3.curveMonotoneX);
  svg
    .append("path")
    .datum(inflationRates)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line)
    .attr("stroke-dasharray", function () {
      return this.getTotalLength();
    })
    .attr("stroke-dashoffset", function () {
      return this.getTotalLength();
    })
    .transition()
    .duration(500)
    .attr("stroke-dashoffset", 0);
  svg
    .selectAll(".dot")
    .data(inflationRates)
    .join("circle")
    .attr("class", "dot")
    .attr("cx", (d) => x(d[0]))
    .attr("cy", height)
    .attr("r", 4)
    .attr("fill", "steelblue")
    .on("mouseover", (event, d) => {
      // Show the tooltip
      tooltip.style("opacity", 1);
      tooltip
        .html(`Year: ${d[0]}<br>Inflation Rate: ${d[1]}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
      d3.select(event.currentTarget)
        .transition()
        .duration(100)
        .attr("r", 6)
        .attr("fill", "orange");
    })
    .on("mouseout", (event) => {
      tooltip.style("opacity", 0);
      d3.select(event.currentTarget)
        .transition()
        .duration(100)
        .attr("r", 4)
        .attr("fill", "steelblue");
    })
    .transition()
    .duration(500)
    .delay((d, i) => i * 40)
    .attr("cy", (d) => y(d[1]));

  // const legend = svg
  //   .append("g")
  //   .attr("class", "legend")
  //   .attr(
  //     "transform",
  //     "translate(" + (width + 100) + "," + height + margin.right + ")"
  //   );

  // legend
  //   .append("rect")
  //   .attr("x", 0)
  //   .attr("y", 0)
  //   .attr("width", 10)
  //   .attr("height", 10)
  //   .attr("fill", "steelblue");

  // legend.append("text").attr("x", 20).attr("y", 10).text("Inflation Rate");

  svg
    .append("g")
    .attr("class", "grid")
    .style("opacity", "0.1")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(-height).tickFormat(""));

  svg
    .append("g")
    .attr("class", "grid")
    .style("opacity", "0.1")
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));
};
