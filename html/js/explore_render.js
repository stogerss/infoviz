function explore_render() {
  var width = 700,
      height = 300;

  var cluster = d3.layout.cluster()
      .size([height, width - 200]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select("footer").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(40,0)");

  root = {
 "name": "Reddit",
 "url": "http://www.reddit.com",
 "time": "10:35",
 "children": [
  {
   "name": "Reddit",
   "url": "http://www.reddit.com/r/pics/comments/1qsle6/what_it_looks_like_when_you_light_a_dandelion_on/",
   "children": [
    {
     "name": "Imgur",
     "url": "http://i.imgur.com/GBob6.jpg",
     "children": [
      {"name": "Imgur", "size": 1000},
      {"name": "Facebook", "size": 1000}
     ]
    },
    {
     "name": "Reddit",
     "children": [
      {"name": "Livememe", "size": 1000},
      {"name": "Mercurynews", "size": 1000},
      {"name": "Psmag", "size": 1000}
     ]
    },
    {
     "name": "Mercurynews",
     "children": [
      {"name": "Crowdynews", "size": 1000}
     ]
    }
   ]
  },
  {
   "name": "Imgur",
   "children": [
    {"name": "Youtube", "children": 
      [
        {"name": "Youtube", "size": 1000},
        {"name": "Gmail"},
        {"name": "Facebook", "size": 1000},
        {"name": "Youtube", "size": 1000}
     ]
   }]
  },
  {
   "name": "r/pics",
   "url": "http://www.reddit.com/r/pics",
   "time": "10:40",
   "children": [
    {
     "name": "Imgur",
     "url": "http://imgur.com/gallery/7oVJDFP",
     "children": [
      {"name": "Imgur", "url": "http://imgur.com/wYaP89E", "size": 721, "children":[{"name": "Imgur", "url": "http://imgur.com/gallery/P6an83U", "children":[{"name": "Imgur"}]}]}
     ]
    },
    {"name": "Imgur", "size": 1759, 
     "url": "http://i.imgur.com/GBob6.jpg"},
    {"name": "Livememe", "size": 3331},
    {"name": "Tumblr", "size": 772}
   ]
  }
 ]
};
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
          // $("#url-title").style.attr("color", "blue");
          $("#url-title").text(d.url);
          $("#time-title").text(d.time);
        });

    node.append("text")
        .attr("dx", function(d) { return d.children ? -10 : 10; })
        .attr("dy", 4)
        .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
        .text(function(d) { return d.name; });


  d3.select(self.frameElement).style("height", height + "px");

  nexts = [];
  count = 0;
  title = "";
  nexts.push(root);

  while (nexts.length != 0) {
    cur = nexts.pop();
    title += cur.name;
    childs = cur.children;
    for (c in childs) {
      nexts.push(childs[c]);
    }
    if(count > 1) {
      break;
    } 
    count += 1;
    title += ", "
  }

  titler(title);
}