/**
 *
 */
let context = d3.select("#map canvas").node().getContext("2d");
let projection = d3.geoEquirectangular();
let geoGenerator = d3.geoPath().projection(projection).context(context);

let country = {
  clickedLocation: null,
};
let geojson = {};

d3.json("http://127.0.0.1:8080/Country/map.geojson").then(function (json) {
  geojson = json;
  initialize();
  update();
});

function update() {
  context.clearRect(20, 20, 2000, 1000);
  projection.fitExtent(
    [
      [20, 20],
      [2000, 1000],
    ],
    geojson
  );
  /*
  	context.lineWidth = 0.5;
  	context.strokeStyle = '#888';
  	context.beginPath();
	geoGenerator({type: 'FeatureCollection', features: geojson.features});
	context.stroke();
	*/
  geojson.features.forEach(function (d) {
    context.lineWidth = 0.5;
    context.strokeStyle = "#888";
    context.beginPath();
    if (country.clickedLocation == null) {
      context.strokeStyle = "#888";
    } else {
      context.strokeStyle =
        country.clickedLocation && d3.geoContains(d, country.clickedLocation)
          ? "red"
          : "#888";
    }
    geoGenerator(d);
    context.stroke();
    //context.fill()
  });
}

function handleClick(e) {
  let pos = d3.pointer(e, this);
  console.log(pos);
  country.clickedLocation = projection.invert(pos);
  console.log(country.clickedLocation);
  update();
}

function initialize() {
  d3.select("#map canvas").on("click", handleClick);
}
