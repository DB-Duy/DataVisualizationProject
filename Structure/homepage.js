/**
 *
 */
let context = d3.select("#map canvas").node().getContext("2d");
let projection = d3.geoEquirectangular();
let geoGenerator = d3.geoPath().projection(projection).context(context);

let country = {
  clickedLocation: null,
  code: null,
  data: null
};
let geojson = {};
let data = null;
let scaleC = null;

d3.json("http://127.0.0.1:8080/Country/map.geojson").then(function (json) {
  geojson = json;
  d3.csv("http://127.0.0.1:8080/Inflation_Annual_Filtered.csv").then(function(d) {
	data = d;
	initialize();
  	update();
	});
});

function update() {
	var sliderValue = document.getElementById("myRange").value;
	d3.select("text.sliderText").text("Year: " + sliderValue);
	
  context.clearRect(20, 20, 1000, 500);
  projection.fitExtent(
    [
      [20, 20],
      [1000, 500],
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
	let number = null;
    context.lineWidth = 0.5;
    context.strokeStyle = "#888";
    context.beginPath();
    
    data.forEach(function(e) {
		
		//console.log(e["Country Code"].trim().toLowerCase());
		//console.log(scaleC(e["2022"]));
		//console.log(d.properties["sov_a3"]);
		if (d.properties["adm0_a3"] == e["Country Code"]) {
			console.log("a");
			if (e[sliderValue] != null) {
				//context.fillStyle(scaleC(e["2022"])); 
				number = e[sliderValue];
				//console.log(number);
			}		
		}
	})
    
    if (country.clickedLocation == null) {
      context.strokeStyle = "#888";
    } else {
      context.strokeStyle =
        country.clickedLocation && d3.geoContains(d, country.clickedLocation)
          ? "red"
          : "#888";
        if (country.clickedLocation && d3.geoContains(d, country.clickedLocation)) {
			country.code = d.properties["adm0_a3"];
			country.data = d;
		}
    }
    if (number != null && number <=20 && number >= -20) {
		context.fillStyle = scaleC(number);
	}
    else {
		if (number > 20) {
			context.fillStyle = "#0571b0";
		} else {
			if (number < -20) {
				context.fillStyle = "#ca0020";
			} else {
				context.fillStyle = "white";
			}
		}
	}
    geoGenerator(d);
    context.stroke();
    context.fill()
  });
  
  if (country.data != null)
  	d3.select("text.name").text(country.data.properties["admin"]);
}

function handleClick(e) {
  let pos = d3.pointer(e, this);
  //console.log(pos);
  country.clickedLocation = projection.invert(pos);
  //console.log(country.clickedLocation);
  update();
}

function initialize() {
  d3.select("#map canvas").on("mousemove", handleClick);
  d3.select("#map canvas").on("click", function(e) {
	  if (country.code != null) {
		  window.location.href = "template.html?country=" + country.code;
	  }
  })
  d3.select("svg.detail").append("g").attr("class", "name").attr("transform", "translate(20,20)");
  d3.select("g.name").append("text").attr("class", "name");
  
  var box = ["#0571b0","#92c5de","#ffffbf","#f4a582","#ca0020"];
  var text = ["<-20",-12,-4,4,12, ">20"];
  d3.select("svg.detail").append("g").attr("class", "legend").attr("transform", "translate(20,40)");
  d3.select("g.legend").selectAll("rect").data(box).join("rect")
  .attr("x", function(d, i) {
	  return 30 + 50*i;
  })
  .attr("y", 30)
  .attr("width", 50)
  .attr("height", 20)
  .attr("class", "legendBox")
  .style("fill", function(d, i) {
	  return d;
  });
  d3.select("g.legend").selectAll("text").data(text).join("text")
  .attr("x", function(d, i) {
	  if (i == 2) {
		  return 20 + 50*i +5;
	  }
	  return 20 + 50*i;
  })
  .attr("y", 70)
  .text(function(d, i) {
	  return d;
  })
  .style("fill", "black");
  
  d3.select("text.sliderText").text("Year: 2022");
  var slider = document.getElementById("myRange");
  slider.oninput = function() {
	  update();
  }
  
  
  scaleC = d3.scaleQuantize().domain([-20, 20])
	//.range(["#ca0020","#f4a582","#92c5de","#0571b0"]);
	.range(["#0571b0","#92c5de","#ffffbf","#f4a582","#ca0020"]);
	//console.log(scaleC(-10));
}
