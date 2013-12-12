$(document).ready(function(){
  $("#explore-back-button").click(function(){
    console.log(Window.scroll_save);
    $("#explore").addClass("hidden");
    $("#detail-graph-container").html("");
    $("#history").removeClass("hidden");
    $('body').scrollTop(Window.scroll_save);
  });
})


function explore_render(root) {
  var width = 800,
      height = 300;

  var cluster = d3.layout.cluster()
      .size([height, width - 200]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select("#detail-graph-container").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(40,0)");

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

    node.append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("x", -10)
      .attr("y", -10)
      .attr("class", function(d,i) {
        if (i==0) { return "active";}
        return "inactive";
      })
      .on("click", function(d) { 
        svg = d3.select("#explore svg");
        console.log(svg);
        svg.selectAll("rect")
          .attr("class", "inactive");
        var current = d3.select(this);
        current.attr("class", "active");
        setIFrame(d);
      });

    node.append("image")
      .attr("xlink:href", function(d) {
        var favicon_url = "http://g.etfv.co/" + d.url + "?defaulticon=lightpng";
        return favicon_url;
        
      })
      .attr("x", -8)
      .attr("y", -8)
      .attr("width", 16)
      .attr("height", 16);

    node.append("foreignObject")
      .attr("x", function(d) { return d.children ? -10 : 10; })
      .attr("y", 15)
      .attr('width', 200)
      .attr('height', 200)
      .append("xhtml:div")
      .html(function(d) {return "<div class='node-text active'>" + "<a href='"+ d.url +"'>" + d.name + "</a></div>"});

  d3.select(self.frameElement).style("height", height + "px");
  var deets = getTitle(root);
  $("#graph-title").html(deets[0]);
}