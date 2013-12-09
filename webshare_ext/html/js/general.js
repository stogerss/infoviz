function prettyDate(dt)
{ 
	dt = new Date(dt);

	var ret = ['Jan.', 'Feb.', 'Mar.', 
            'Apr.', 'May', 'Jun.',
            'Jul.', 'Aug.', 'Sep.', 
            'Oct.', 'Nov.', 'Dec.'][dt.getMonth()] + " " +
            (function (d) { 
                var s = d.toString(), l = s[s.length-1];
                return s+(['st','nd','rd'][l-1] || 'th');
            })(dt.getDate()) + ", " +
            dt.getHours() + ":" + ("0" + dt.getMinutes()).slice(-2);
	var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
	ret = days[dt.getDay()] + " " + ret;
    return ret;
}           

function getTitle(root) {
	
	nexts = [];
  	nexts.push(root);
  	var names = {};

  	while (nexts.length != 0) {
  		cur = nexts.pop();
  		var current = cur.name.split(" ");
  		if (current.length == 1) {
  			names[current[0]] = ["EMPTY"];
  		} else if (!(current[0] in names)){
			names[current[0]] = [current[1]];
		} else {
			names[current[0]].push(current[1]);
		}
		childs = cur.children;
		for (c in childs){
			nexts.push(childs[c]);
		}
  	}

  	var title = "";
  	for (var key in names) {
  		title += "<div class='domain'>"
  		title += "<span>" + key + "</span>";
  		for (var i = 0; i< names[key].length; i++){
  			var sub = names[key][i];
  			if (sub == "EMPTY") {
  				continue;
  			} else if (i==0){
  				title += ": " + sub;
  			} else {
  				title += ", " + sub;
  			}
  		}
  		title += "</div>"
  	}
  	return [title, prettyDate(root.time)];

}


function getHTML() {

}

$(document).ready(function(){

	//Define some global variables
	Window.scroll_save = 0;
	Window.localhost = "http://127.0.0.1:5000/webshare/api/v1.0/";
	Window.server_data;

	//Search behavior
	function clearHTML(){
	    $("#history-graph-container").html("");
	    $("#search-graph-results").html("");
	 }

	$('#graph-search').keypress(function (e) {
		var val = $("#graph-search").val();

		if (e.which == 13 && val != "") {
			console.log("Making search query " + val );
		  $.get(Window.localhost +"search/" + val , function(data){
		    console.log("Search query returned");
		    console.log(data.graph);
		    
		    //Clear both of them and render the search
		    clearHTML();
		    render_multiple(data.graph, "#search-graph-results");

		    //Unhide search if hidden
		    if ($("#search-graph-container").hasClass("hidden")) {
		     $("#search-graph-container").removeClass("hidden");
		    }
		  })
		}
	});

	$("#graph-search").change(function(){
	var val = $("#graph-search").val();
	if (val === ""){
	  console.log("Search empty clearing");
	  clearHTML();

	  //Hide search and render the regular stuff
	  $("#search-graph-container").addClass("hidden");
	  render_multiple(Window.server_data, "#history-graph-container");
	}  
	});	

	//Actually render the home screen graph stuff
	// alert("hello");
	$(document).ready(function(){
	  //Get the JSONs!
	  var server_data;
	  $.get(Window.localhost, function(data){
	    console.log("Get request done");
	    console.log(data);
	    Window.server_data = data.graph;
	    render_multiple(Window.server_data, "#history-graph-container");
	  })
	});

});
