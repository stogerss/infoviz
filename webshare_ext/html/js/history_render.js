function transferToExplore(){
  //should launch explore
  var body_scroll = $("body").scrollTop();
  $("#explore").removeClass("hidden");
  $("#history").addClass("hidden");
  console.log(body_scroll);
  Window.scroll_save = body_scroll;
  $('body').scrollTop(0);
  return;
}

function render_multiple(json_list, container) {

	// return
	for (j in json_list) {
		json = json_list[j];
		add_html(j, container);
		history_render(json, j);
	}
}

function add_html(j, container) {


  var graph_title = "<div class='graph-title'> <div id='date"+ parseInt(j) + "' class='date'> Graph Date </div>  <div id=\"title" +parseInt(j)+ "\" class='name'>  Graph Detail </div> </div> ";
  var graph_holder = "<div class=\"graph-holder\" id=f" + parseInt(j) + " \"> </div>";
  var graph_frame_html = 
    "<div class=\"graph-view\"> " + graph_title + graph_holder + "</div>";
  $(container).append(graph_frame_html);
}

function history_render(root, j) {

  var width = 700,
      height = 250;

  var cluster = d3.layout.cluster()
      .size([height, width - 200]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select("#f"+parseInt(j)).append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(100,0)");


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
        .attr("class", function(d) {
        	if (d.count) {
        		return "active";
        	} else {
        		return "inactive";
        	}
        })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .on("click", function(d) { 
          tip.hide();
          transferToExplore();
          explore_render(root);
        });

    node.append("text")
        .attr("dx", function(d) { return d.children ? -10 : 10; })
        .attr("dy", 4)
        .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
        .text(function(d) { return d.name; });

  d3.select(self.frameElement).style("height", height + "px");
  applyTitle(j,root);
  
}
