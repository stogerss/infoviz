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
  var map = {};
  console.log(json_list);
  for (j in json_list) {
    var node = json_list[j];
    var time = new Date(node.time);
    time = time.getTime();
    if (time in map) {
      map[time].push(node);
    } else {
      map[time] = [node];
    }
  }

  var keys = Object.keys(map);
  keys = keys.sort(function(a,b) {return b-a});
  
  var count = 0;
  for (var i =0; i< keys.length; i++){
    var key = keys[i];
    for (var j =0; j< map[key].length; j++) {
      add_html(count, container);
      history_render(map[key][j], count);
      count++
    }
  }

	// for (j in json_list) {
	// 	json = json_list[j];
	// 	add_html(j, container);
	// 	history_render(json, j);
	// }
}

function add_html(j, container) {


  var graph_title = "<div class='graph-title'> <div id='date"+ parseInt(j) + "' class='date'> Graph Date </div>  <div id=\"title" +parseInt(j)+ "\" class='name'>  Graph Detail </div> </div> ";
  var graph_holder = "<div class=\"graph-holder\" id=f" + parseInt(j) + " \"> </div>";
  var graph_frame_html = 
    "<div class=\"graph-view\"> " + graph_title + graph_holder + "</div>";
  $(container).append(graph_frame_html);
}

function history_render(root, j) {

  //Create the explore clicker for this guy
  var click_div =  document.createElement("div");
  click_div.id = "explore-button" + parseInt(j);
  $(click_div).attr('class', "explore-button");
  $(click_div).html("View details..");
  
  //Bind it
  $(click_div).on("click", function(){
    transferToExplore();
    explore_render(root);
    setIFrame(root);
  });

  var title_element = $("#f" + parseInt(j)).parent().children(".graph-title")[0];
  $(title_element).append(click_div);


  //Create the SVG and stuff..
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
      .attr("transform", "translate(50,-15)");

  var nodes = cluster.nodes(root),
      links = cluster.links(nodes);

  var link = svg.selectAll(".link")
      .data(links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", diagonal);

  var tooltip = d3.select("body")
      .append("div")
      .style("font-size", "11px")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("height", "100px")
      .style("width", "150px")
      .text("Sample");

  var node = svg.selectAll(".node")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .on("mouseover", function(d){return tooltip.style("visibility", "visible").text(d.name);})
      .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

  node.append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("x", -10)
      .attr("y", -10)
      .attr("class", function(d) {
      	if (d.count) {
      		return "active";
      	} else {
      		return "inactive";
      	}
      })
      .on("click", function(d) { 
        window.open(d.url);
      })
      .append("svg:title")
      .text(function(d) {return  d.url});;


  node.append("image")
    .attr("xlink:href", function(d) {
      var url = d.url;
      if (url.indexOf("mikesbikes") >0) {
        return "http://mikesbikes.com/merchant/344/images/site/mblogo_140x125.jpg";
      }
      var favicon_url = "http://g.etfv.co/" + url + "?defaulticon=lightpng";
      return favicon_url;
      
    })
    .attr("x", -8)
    .attr("y", -8)
    .attr("width", 16)
    .attr("height", 16);

  var deets = getTitle(root);
  titler(j, deets[0], deets[1]);
  
}

function titler(j, title, date) {
  $("#title" + parseInt(j)).html(title);
  $("#date" + parseInt(j)).html(date);
}
