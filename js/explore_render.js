function render() {
  var width = 700,
      height = 500;

  var cluster = d3.layout.cluster()
      .size([height, width - 200]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select("footer").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(40,0)");

  d3.json("flare.json", function(error, root) {
    var nodes = cluster.nodes(root),
        links = cluster.links(nodes);

    var link = svg.selectAll(".link")
        .data(links)
      .enter().append("path")
        .attr("class", "link")
        .attr("d", diagonal);

    var node = svg.selectAll(".node")
        .data(nodes)
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return "<span>" + d.url + "</span>";
        });

    svg.append("tip_holder").call(tip);

    node.append("circle")
        .attr("r", 6)
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .on("click", function(d) { 
          tip.hide();
          svg = d3.select("svg");
          svg.selectAll("circle")
            .style("fill", "#B4CDCD")
            .style("stroke", "#5F9F9F")
          current = d3.select(this);
          current.style("fill", "#ffb2b2")
            .style("stroke", "#ff4c4c");
          document.getElementById("page-view").src = d.url;
        });

    node.append("text")
        .attr("dx", function(d) { return d.children ? -10 : 10; })
        .attr("dy", 4)
        .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
        .text(function(d) { return d.name; });
  });

  d3.select(self.frameElement).style("height", height + "px");
}