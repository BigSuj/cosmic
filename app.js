// Margins, width and height
var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = 450 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Append the svg object to the div
var svg = d3.select("#heatmap")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Read the data
d3.csv('data1.csv').then(data => {
    data.forEach(d => {
      d.month = +d.month;
      d.hour = +d.hour;
      d.count = +d.count;
    });
  
    var months = Array.from(d3.group(data, d => d.month).keys());
    var hours = Array.from(d3.group(data, d => d.hour).keys());

  // Build X scales and axis:
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(hours)
    .padding(0.05);
  svg.append("g")
    .style("font-size", 15)
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .select(".domain").remove();

  // Build Y scales and axis:
  var y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(months)
    .padding(0.05);
  svg.append("g")
    .style("font-size", 15)
    .call(d3.axisLeft(y))
    .select(".domain").remove();

  // Build color scale
  var myColor = d3.scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([1,100])

  // Create a tooltip
  var tooltip = d3.select("#heatmap")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    tooltip.style("opacity", 1)
  }

var mousemove = function(d) {
    tooltip
      .html("The exact value of<br>this cell is: " + d.count)
      .style("left", (d3.mouse(this)[0]+70) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouseleave = function(d) {
    tooltip.style("opacity", 0)
  }

  // Add the squares
  svg.selectAll()
    .data(data, function(d) {return d.month+':'+d.hour;})
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.hour) })
      .attr("y", function(d) { return y(d.month) })
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.count)} )
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

})

function createNetwork() {
  // Margins, width and height
  const margin = {top: 30, right: 30, bottom: 30, left: 30},
  width = 900 - margin.left - margin.right,
  height = 650 - margin.top - margin.bottom;

  // Append the svg object to the div
  const svg = d3.select("#network-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

  d3.json("bigrams.json").then(function(bigrams) {
    let nodesObj = bigrams.reduce(function(obj, bigram) {
      if (!obj[bigram.word1] || obj[bigram.word1].frequency < bigram.word1_count) {
        obj[bigram.word1] = {
          word: bigram.word1,
          frequency: bigram.word1_count
        };
      }
      if (!obj[bigram.word2] || obj[bigram.word2].frequency < bigram.word2_count) {
        obj[bigram.word2] = {
          word: bigram.word2,
          frequency: bigram.word2_count
        };
      }
      return obj;
    }, {});
    
    let nodes = Object.values(nodesObj);    
    console.log(nodes);

    let radiusScale = d3.scaleSqrt()
      .domain([1, d3.max(nodes, function(d) { return d.frequency; })])
      .range([20, 80]);

    function getNodeRadius(d) {
      return radiusScale(d.frequency);
    }
    

    let links = bigrams.map(function(bigram) {
      return {
        source: bigram.word1,
        target: bigram.word2,
        arrow: true
      };
    });

    // Define these variables according to your requirements
    let markerBoxWidth = 10;
    let markerBoxHeight = 10;
    let refX = markerBoxWidth / 2; // Adjust this if needed
    let refY = markerBoxHeight / 2; // Adjust this if needed

    // Define the arrow points according to your requirements
    // This example creates a basic triangular arrow
    let arrowPoints = [[0, 0], [0, 10], [10, 5]];
    let lineGenerator = d3.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });

      svg
        .append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
        .attr('refX', refX)
        .attr('refY', refY)
        .attr('markerWidth', markerBoxWidth)
        .attr('markerHeight', markerBoxHeight)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d3.line()(arrowPoints))
        .attr('stroke', 'white')
        .attr('fill', 'white');

        svg.append("defs")
        .append("radialGradient")
        .attr("id", "gradient")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%")
        .attr("fx", "50%")
        .attr("fy", "50%")
        .selectAll("stop")
        .data([
          {offset: "0%", color: "red"},
          {offset: "100%", color: "orange"}
        ])
        .enter().append("stop")
        .attr("offset", function(d) { return d.offset; })
        .attr("stop-color", function(d) { return d.color; });


    let link = svg.selectAll(".link")
        .data(links)
        .enter().append("path")
        .attr('stroke', 'white')
        .attr('marker-end', 'url(#arrow)')  // Use the arrow marker
        .attr("class", "link");

    let node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", function(d) { return radiusScale(d.frequency); })
        .attr("fill", "steelblue")
        .on("click", nodeClicked)  // add click event
      function nodeClicked(event,d) {
        event.preventDefault();
          // Filter links to only those that originate from the clicked node
          let filteredLinks = links.filter(link => link.source.word === d.word);
          let selectedNode = d.word
          console.log(node);
          node.attr("fill", function(d) {
            return d.word === selectedNode ? "url(#gradient)" : "steelblue";
          });
          // Update the visual representation of the links
          link = link.data(filteredLinks, function(d) { return d.source; });
          node.exit().remove();
          link.exit().remove();
        link = link.enter().append("path")
            .attr('stroke', 'white')
            .attr('marker-end', 'url(#arrow)')  // Use the arrow marker
            .attr("class", "link")
            .merge(link);
        link.each(function() {
              this.parentNode.insertBefore(this, node.nodes()[0]);
          });
    
          // Update the visual representation of the nodes
          node = node.enter().append("circle")
            .attr("class", "node")
            .attr("r", function(d) { return radiusScale(d.frequency); })
            .attr("fill", function(node) { return node.word === d.word ? "red" : "steelblue"; })  // Change the color of the clicked node
            .on("click", nodeClicked)  // add click event
            .merge(node);

            simulation.nodes(nodes)
            .force("link").links(filteredLinks);
          simulation.alpha(1).restart();
          }
    


    var label = svg.selectAll(".text")
      .data(nodes)
      .enter().append("text")
      .text(function(d) { return d.word; })
      .attr("text-anchor", "middle")
      .attr('font-size', '20px')
      .attr("dy", "0.3em");


    let simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(function(d) { return d.word; }).distance(600).strength(0.5))  // Adjusted distance and strength
      .force("charge", d3.forceManyBody().strength(-500))  // Adjusted charge strength
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(function(d) {
        return radiusScale(d.frequency) + 1.5;  // Adjusted collision radius
      }))
      .on("tick", ticked);

      function ticked() {
        link.attr("d", function(d) {
          let dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y,
              dr = Math.sqrt(dx * dx + dy * dy) + 0.001,  // Add a small constant
              radius = radiusScale(d.target.frequency),
              offsetX = (dx * radius) / dr,
              offsetY = (dy * radius) / dr,
              targetX = d.target.x - offsetX,
              targetY = d.target.y - offsetY,
              newTarget = { x: targetX, y: targetY };
      
          return lineGenerator([d.source, newTarget]);
        });
      
        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      
        label.attr("x", function(d) { return d.x; })
             .attr("y", function(d) { return d.y; });
      }
      

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  });
}






function createUSMap(containerId, width, height) {
  // Width and height of the SVG container
  var width = 960;
  var height = 600;

  // Create a new SVG element
  var svg = d3.select(containerId)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

  // Create a projection to determine the "perspective" of the map.
  var projection = d3.geoAlbersUsa()
      .translate([width/2, height/2]);

  // Define path generator
  var path = d3.geoPath()               
      .projection(projection);  

  // Load GeoJSON data
  d3.json("us-states.json").then(function(json) {

      // Bind the data to the SVG and create one path per GeoJSON feature
      svg.selectAll("path")
          .data(json.features)
          .join("path")
          .attr("d", path)
          .style("stroke", "#fff")
          .style("stroke-width", "1")
          .style("fill", "#ccc");

      // Load nodes and links data
      Promise.all([
        d3.json("nodes.json"),
        d3.json("links.json"),
      ]).then(function(files) {
        var nodesData = files[0];
        var linksData = files[1];
    
        // Map of node id to node object
        var nodesMap = new Map(nodesData.map(node => [node.id, node]));
    
        // Replace source and target ids with node objects
        var links = linksData.map(link => {
          return {
            source: nodesMap.get(link.source),
            target: nodesMap.get(link.target),
            year: link.year
          };
        });

          // Load CSV data
          d3.csv("processed_data.csv").then(function(data) {
            var slider = d3.select("#yearSlider");
            var timeframeDisplay = d3.select("#timeframe");

            // Update function
            function update(year) {
                var startYear = year;
                var endYear = year + 9;

                // Filter out data points with null or undefined latitudes and longitudes
                var filteredData = data.filter(function(d) {
                  return +d.year >= startYear && +d.year <= endYear && d.latitude && d.longitude;
                });

                // Filter out links with null or undefined source or target
                var filteredLinks = links.filter(function(d) {
                  return +d.year >= startYear && +d.year <= endYear;
                });
                // Bind the data to the SVG and create one circle per data point
                var circles = svg.selectAll("circle")
                    .data(filteredData, function(d) { return d.latitude + d.longitude; });

                circles.enter()
                    .append("circle")
                    .attr("cx", function(d) {
                        return projection([d.longitude, d.latitude]) ? projection([d.longitude, d.latitude])[0] : null;
                    })
                    .attr("cy", function(d) {
                        return projection([d.longitude, d.latitude]) ? projection([d.longitude, d.latitude])[1] : null;
                    })
                    .attr("r", 5) // radius of circles, adjust as needed
                    .style("fill", "red"); // color of circles

                circles.exit().remove();

                // Draw the links
                var link = svg.selectAll(".link")
                .data(filteredLinks, function(d) { return d.source.id + "-" + d.target.id; });
            link.enter()
                .append("line")
                .attr("class", "link")
                .attr("x1", function(d) { return projection([d.source.longitude, d.source.latitude])[0]; })
                .attr("y1", function(d) { return projection([d.source.longitude, d.source.latitude])[1]; })
                .attr("x2", function(d) { return projection([d.target.longitude, d.target.latitude])[0]; })
                .attr("y2", function(d) { return projection([d.target.longitude, d.target.latitude])[1]; })
                .attr("stroke", "white")
                .style("stroke-width", 1);

            link.exit().remove();

            // Update timeframe display
            timeframeDisplay.text(startYear + " - " + endYear);
        }

        // Initialize
        update(+slider.property("value"));

        // Update based on slider
        slider.on("input", function(event) {
            update(+event.target.value);
        });
      });
  });
});
}
            


// Usage example
createUSMap("#map-container", 800, 500);

createNetwork();
//createStateNetwork();

// Random UFO-related words to simulate typing effect
var typingWords = [
  "Trace",
  "Discover",
  "Uncover",
  "Chart",
  "Explore",
  "Journey"
];

// Get the target elements
var typingElement = document.getElementById("typingEffect");
var ufoElement = document.getElementById("ufo");

// Function to simulate typing effect
function simulateTypingEffect() {
  var wordIndex = typingWords.length - 1;
  typingElement.textContent = typingWords[wordIndex];

  // Add class to trigger the animation
  typingElement.classList.add("typing-effect");
}

// Call the typing effect function on page load or refresh
window.onload = function () {
  // Hide the element initially
  typingElement.style.visibility = "hidden";

  // Start the typing effect after a short delay
  setTimeout(function() {
    // Show the element
    typingElement.style.visibility = "visible";

    // Trigger the typing effect animation
    simulateTypingEffect();
  }, 500); // Adjust the delay as needed
};

