function createHeatmap() {  
  // Margins, width and height
  var margin = {top: 30, right: 30, bottom: 30, left: 30},
      width = 700 - margin.left - margin.right,
      height = 675 - margin.top - margin.bottom;

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
    
      var hours = Array.from(d3.group(data, d => d.hour).keys());

    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var months = Array.from(d3.group(data, d => d.month).keys()).map(m => monthNames[m-1]);

    // Build X scales and axis:
    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(months)
      .padding(0.05);
    svg.append("g")
      .style("font-size", 15)
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .select(".domain").remove();

    // Build Y scales and axis:
    var y = d3.scaleBand()
      .range([ height, 0 ])
      .domain(hours)
      .padding(0.05);
    svg.append("g")
      .style("font-size", 15)
      .call(d3.axisLeft(y))
      .select(".domain").remove();


    // Build color scale
    var minCount = d3.min(data, function(d) { return d.count; });
    var maxCount = d3.max(data, function(d) { return d.count; });
    var myColor = d3.scaleSequential()
      .interpolator(d3.interpolateInferno)
      .domain([minCount,maxCount])

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
      .style('color', 'black')
      .style("position", "absolute");

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
      tooltip.style("opacity", 1)
    }

    function timeConverter(hour) {
      suffix = hour < 12 ? "AM":"PM";
      hour = ((hour + 11) % 12 + 1);
      return hour + ' ' + suffix;
    }

    var mousemove = function(event, d) {
      tooltip
      .html("Month: " + monthNames[d.month -  1] + "<br>Hour: " + timeConverter(d.hour) + "<br>Count: " + d.count)
        .style("left", (d3.pointer(event)[0]+40) + "px")
        .style("top", (d3.pointer(event)[1] + 40) + "px")
    }
    
    var mouseleave = function(d) {
      tooltip.style("opacity", 0)
    }

    // Add the squares
    // Add the squares
      svg.selectAll()
      .data(data, function(d) {return d.month+':'+d.hour;})
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(monthNames[d.month - 1]) }) // Use x for month
        .attr("y", function(d) { return y(d.hour) }) // Use y for hour
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return myColor(d.count)} )
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .on("mouseover", function(d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("width", x.bandwidth() * 1.1 )
            .attr("height", y.bandwidth() * 1.1 )
            .attr("x", d => x(monthNames[d.month - 1]) - x.bandwidth() * 0.05)
            .attr("y", d => y(d.hour) - y.bandwidth() * 0.05);
        mouseover(d);
    })
    .on("mouseleave", function(d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .attr("x", function(d) { return x(monthNames[d.month - 1]) })
            .attr("y", function(d) { return y(d.hour) });
        mouseleave(d);
    })
    

  })
}


function createNetwork() {
  // Margins, width and height
  const margin = {top: 30, right: 30, bottom: 30, left: 30},
  width = 700 - margin.left - margin.right,
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

    let radiusScale = d3.scaleSqrt()
      .domain([1, d3.max(nodes, function(d) { return d.frequency; })])
      .range([15, 45]);

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
          {offset: "0%", color: "#58f707"},
          {offset: "100%", color: "#000000"}
        ])
        .enter().append("stop")
        .attr("offset", function(d) { return d.offset; })
        .attr("stop-color", function(d) { return d.color; });


    let link = svg.selectAll(".link-network")
        .data(links)
        .enter().append("path")
        .attr('stroke', 'white')
        .attr('marker-end', 'url(#arrow)')  // Use the arrow marker
        .attr("class", "link-network");

    let node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", function(d) { return radiusScale(d.frequency); })
        .attr("fill", "#4c4c67")
        .on("click", nodeClicked)  // add click event
      function nodeClicked(event,d) {
        event.preventDefault();
          // Filter links to only those that originate from the clicked node
          let filteredLinks = links.filter(link => link.source.word === d.word);
          let selectedNode = d.word
          node.attr("fill", function(d) {
            return d.word === selectedNode ? "#85bda2" : "#4c4c67";
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
            .attr("fill", function(node) { return node.word === d.word ? "red" : "#4c4c67"; })  // Change the color of the clicked node
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
      .force("link", d3.forceLink(links).id(function(d) { return d.word; }).distance(250).strength(0.5))  // Adjusted distance and strength
      .force("charge", d3.forceManyBody().strength(-300))  // Adjusted charge strength
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
  });
}






function createUSMap(containerId, width, height) {
  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const filter = svg.append("filter")
    .attr("id", "glow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

  filter.append("feGaussianBlur")
    .attr("stdDeviation", 5)
    .attr("result", "glow-blur");

  const merge = filter.append("feMerge");
  merge.append("feMergeNode").attr("in", "glow-blur");
  merge.append("feMergeNode").attr("in", "SourceGraphic");

  svg.style("filter", "url(#glow)");

  const projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2]);

  const path = d3.geoPath()
    .projection(projection);

  let zoom = d3.zoom()
    .filter(event => {
      return !(event.type === 'mousedown') && (event.type === 'wheel' || event.type === 'dblclick');
    })
    .scaleExtent([1, 8])
    .on('zoom', (event) => {
      svg.attr('transform', event.transform);
    });


  // Update zoom behavior to zoom into the cluster that was clicked
  function zoomToCluster(event, d, individualPoints, link) {
    let circles = svg.selectAll(".map-cluster")
    const [x, y] = d3.pointer(event);

    event.stopPropagation();
    const scale = 2; // Define your desired zoom level here
    const translate = [(width - scale * x), (height - scale * y)];

    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(...translate)
        .scale(scale)
    );
    circles.style("display", "none");
    individualPoints.style("display", "block");
    link.style("display", "block");
  }

  d3.json("us-states.json").then(function (json) {
    svg.selectAll("path")
      .data(json.features)
      .join("path")
      .attr("d", path)
      .style("stroke", "#666") 
      .style("stroke-width", "1")
      .style("fill", "#333"); 

    Promise.all([
      d3.json("nodes.json"),
      d3.json("links.json"),
    ]).then(function (files) {
      const nodesData = files[0];
      const linksData = files[1];
      const nodesMap = new Map(nodesData.map(node => [node.id, node]));

      const links = linksData.map(link => ({
        source: nodesMap.get(link.source),
        target: nodesMap.get(link.target),
        year: link.year
      }));

      d3.csv("processed_data.csv").then(function (data) {
        const slider = d3.select("#yearSlider");
        const timeframeDisplay = d3.select("#timeframe");

        function update(year) {
          svg.selectAll(".individual-point").remove();
          svg.selectAll(".link").remove();
          const startYear = year;
          const endYear = year + 9;

          const filteredData = data.filter(function (d) {
            const coordinates = projection([d.longitude, d.latitude]);
            return +d.year >= startYear && +d.year <= endYear && coordinates;
          });
              // create individual points (circles)
          let individualPoints = svg.selectAll(".individual-point")
            .data(filteredData, d => d.index)
            .enter()
            .append("circle")
            .attr("class", "individual-point")
            .attr("cx", d => projection([d.longitude, d.latitude])[0])
            .attr("cy", d => projection([d.longitude, d.latitude])[1])
            .attr("r", 2) // adjust size as necessary
            .style("fill", "#3a0c57") // adjust color as necessary
            .style("display", "none"); // hide individual points initially
          individualPoints.exit().remove();
          
          // create links
          // Filter links for the selected timeframe
          let filteredLinks = links.filter(link => link.year >= startYear && link.year <= endYear);
          let link = svg.selectAll(".link")
            .data(filteredLinks)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr("x1", d => projection([d.source.longitude, d.source.latitude])[0])
            .attr("y1", d => projection([d.source.longitude, d.source.latitude])[1])
            .attr("x2", d => projection([d.target.longitude, d.target.latitude])[0])
            .attr("y2", d => projection([d.target.longitude, d.target.latitude])[1])
            .style("stroke", "#58f707")
            .style("stroke-width", 3)
            .style('opacity', '0.8')
            .style("display", "none") // hide links initially
            .style("filter", "url(#glow)"); 
          link.exit().remove();

          let clusters = [];

          const projectedPoints = filteredData.map(function (d) {
            const projectedPoint = projection([d.longitude, d.latitude]);
            return { x: projectedPoint[0], y: projectedPoint[1] };
          });

          let quadtree = d3.quadtree()
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; })
            .addAll(projectedPoints);

          const radius = 40;

          quadtree.visit(function (node, x1, y1, x2, y2) {
            const clusteredPoint = node.data;
            if (!clusteredPoint || clusteredPoint.cluster) return;
            let cluster = [clusteredPoint];
            clusteredPoint.cluster = cluster;
            quadtree.visit(function (subnode, subx1, suby1, subx2, suby2) {
              const point = subnode.data;
              if (!point) return;
              const dx = clusteredPoint.x - point.x;
              const dy = clusteredPoint.y - point.y;
              if (dx * dx + dy * dy <= radius * radius) {
                point.cluster = cluster;
                cluster.push(point);
              }
            });

            clusters.push(cluster);
          });

            // Bind the data to the SVG and create one circle per cluster
            let circles = svg.selectAll(".map-cluster")
              .data(clusters, d => d[0].id);

            circles.enter()
              .append("circle")
              .attr('class', 'map-cluster')
              .attr('opacity', '0.7')
              .attr("cx", d => d[0].x)
              .attr("cy", d => d[0].y)
              .attr("r", d => (Math.sqrt(d.length) * radius) / 45) // Radius is proportional to the square root of the cluster size
              .style("fill", "#ff00ff") // Use a vibrant alien color
              .on('click', (event, d) => {
                zoomToCluster(event, d, individualPoints, link);
              });

            circles.exit().remove();

            // Update timeframe display
            timeframeDisplay.text(startYear + " - " + endYear);
            d3.select("#resetZoom").on("click", () => {
              svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity
              );
              circles.style("display", "block");
              individualPoints.style("display", "none");
              link.style("display", "none");
              update(+slider.property("value"))
            });    
          }
            // Initialize
            update(+slider.property("value"));

            // Update based on slider
            slider.on("input", (event) => {
              update(+event.target.value);
            });
        

            }).catch((error) => console.error(error));
          });
        });
};






            

createHeatmap();

// Usage example
createUSMap("#map-container", 800, 500);

createNetwork();
//createStateNetwork();

// Random UFO-related words to simulate typing effect
var typingWords = [
  "Cosmic Cartographer"
]

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

