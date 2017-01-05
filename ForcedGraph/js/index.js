var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(500))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width / 2, height / 4));




d3.json("miserables.json", function(error, graph) {
  if (error) throw error;



    var nodeLevels = {};
    var chart = $("#topo");
    var totalLevels = 0;
    var nodes = graph.nodes;


    nodes.forEach(function(node){
        var levelExists = (node.level && nodeLevels.hasOwnProperty(node.level)) ? true : false;
        if(levelExists) {
            nodeLevels[node.level] ++;        
        }
        else {
            nodeLevels[node.level] = 1;
            totalLevels++;
        }   
    });

    var _colWidth = (width / totalLevels);

    nodes.forEach(function(node){
        node.calcX = ((_colWidth * (node.level)) / 2) + ((node.level - 1) * (_colWidth / 2));
        console.log("calcX" + node.calcX );
    });

  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", function(d) { return Math.sqrt(d.value); });


// // Use curved connections rather than straight line links
// var path = svg.append("svg:g").selectAll("path")
//     .data(graph.links)
//     .enter().append("svg:path")
//     .attr("class", "link");

  var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("r", 5)
    .attr("fill", function(d) { return color(d.group); })
    // .call(d3.drag()
    //     .on("start", dragstarted)
    //     .on("drag", dragged)
    //     .on("end", dragended));

  node.append("title")
      .text(function(d) { return d.id; });

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {

    // // Curved links
    // path.attr("d", function(d,i){
    //     var dx = d.target.calcX - d.source.calcX,
    //         dy = (d.target.y) - (d.source.y),
    //         dr = Math.sqrt(dx*dx + dy*dy);

    //     return "M" +
    //         d.source.calcX + "," +
    //         (d.source.y) + "C" +
    //         dr + "," + (d.source.y) + " " + 
    //         dr + "," +
    //         (d.target.y) + " " +
    //         d.target.calcX + "," +
    //         (d.target.y);
    // });

    link
        .attr("x1", function(d) { return d.source.calcX; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.calcX; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.calcX; })
        .attr("cy", function(d, i ) { return d.y});
  }
});

// Drag not required at the moment

// function dragstarted(d) {
//   if (!d3.event.active) simulation.alphaTarget(0.3).restart();
//   d.fx = d.calcX;
//   d.fy = d.y;
// }

// function dragged(d) {
//   d.fx = d3.event.x;
//   d.fy = d3.event.y;
// }

// function dragended(d) {
//   if (!d3.event.active) simulation.alphaTarget(0);
//   d.fx = null;
//   d.fy = null;
// }