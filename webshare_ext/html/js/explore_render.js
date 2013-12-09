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
  var width = 700,
      height = 300;

  var cluster = d3.layout.cluster()
      .size([height, width - 200]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });


  //TODO: wrap svg around container?
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

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return "<span>" + d.url + "</span>";
        });

    svg.append("tip_holder").call(tip);

    node.append("circle")
        .attr("r", 6)
        .attr("class", function(d, i) {
          if (i==0){
            return "active";
          } else {
            return "inactive";
          }
        })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .on("click", function(d) { 
          tip.hide();
          svg = d3.select("#explore svg");
          console.log(svg);

          svg.selectAll("circle")
            .attr("class", "inactive");

          var current = d3.select(this);
          current.attr("class", "active");

          document.getElementById("page-view").src = d.url;
          $("#url-title").text(d.url);
          $("#time-title").text(d.time);
        });

    node.append("text")
        .attr("dx", function(d) { return d.children ? -10 : 10; })
        .attr("dy", 4)
        .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
        .text(function(d) { return d.name; });

  d3.select(self.frameElement).style("height", height + "px");
  applyTitle(j,root)
}