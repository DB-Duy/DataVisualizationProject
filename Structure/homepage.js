/**
 * 
 */
let context = d3.select("#map canvas").node().getContext("2d");
let projection = d3.geoEquirectangular();
let geoGenerator = d3.geoPath()
  .projection(projection)
  .context(context);
  
d3.json("ne_110m_admin_0_countries.json").then(function(geojson) {
	projection.fitExtent([[20, 20], [2000, 1000]], geojson);

  	context.lineWidth = 0.5;
  	context.strokeStyle = '#888';
  	context.beginPath();
	geoGenerator({type: 'FeatureCollection', features: geojson.features});
	context.stroke();
});