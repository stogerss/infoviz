$.ajaxSetup({
  contentType: "application/json; charset=utf-8"
});

console.log("I'm the background");
var node_list = [];
var root_ids = [];
var localhost = "http://localhost:5000/webshare/api/v1.0/";
var currently_active = {};

function getURLFromSearch(search) {
	var s = decodeURIComponent(search);
	var url_index = s.indexOf("&url=");
	//Remove all before it
	if (url_index >= 0) {
		//Offset by 5 so we remove the url paramater
		s = s.substring(url_index + 5);
	}
	//Remove all after it
	url_index = s.indexOf("&");
	if (url_index >= 0){
		s = s.substring(0,url_index);
	}
	console.log(s);
	return s;
}

//This function will eventually push to server
function registerNode(node){	
	//console.log(node);
	var node_string = JSON.stringify(node);
	console.log("Pushing" + node_string);
	$.post(localhost, node_string, function(data){
		//console.log(data);
		console.log("Sucessful push");
		node_list.push(node);
	});
	
}

//When we create a new tab, we mark it as a tab that has been created by chrome. 
chrome.tabs.onCreated.addListener(function(tab){
	
	//TODO: Only a newtab if you go to newtab, need to make this more general?
	if (tab.url.indexOf("newtab") >= 0) {
		//If its a newtab page, then you put its id in the root_ids array
		root_ids.push(tab.id);	
	} 

});

chrome.tabs.onRemoved.addListener(function(tabId) {
	delete currently_active[tabId];
});

//Then when a "newtab" is updated with some url, it acts as a root node.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	
	console.log("Updated: " + tab.url + " at " + tabId);

	if (tab.url.indexOf("newtab") >= 0) {
		//If its still newtab, then you just ignore it
		return;
	}

	//Check if its coming straight from a newtab
	var valid = false;
	var current_id = -1;
	for (var i=0; i< root_ids.length; i++){
		if (root_ids[i] == tabId){
			valid = true;
			current_id = i;
		}
	}

	if (! valid ) {
		//If its not a root node, check if its a url change from a previous node
		if (tabId in currently_active) {
			if (currently_active[tab.id] != tab.url) {
				//Register the node as being changed (WARNING: MAY DOUBLE UP WITH LINK!)
				registerNode({"from": currently_active[tab.id], "to": tab.url, "id": tab.id});
				currently_active[tab.id] = tab.url;
			}
		}
		//Not a root node
		return;
	} else {
		//TODO: This may be jank - make it better
		//Checking if its a legit url that its going to
		if (tab.url.indexOf("http") >= 0 ) {
			root_ids.splice(current_id,1);
			currently_active[tabId] = tab.url;
			registerNode({"from": "root", "to": tab.url, "id": tabId});
		}
	}
	
});

//Get messages from client scripts
chrome.runtime.onMessage.addListener(function(data, sender){
	if (data.debug != null){
		console.log(data.debug);
		return;
	}
	if (data.node != null){
		var node = data.node;

		if (! data.node.to || ! data.node.from) {
			//Don't do anything its a shit url
			return;
		}
		
		if (data.node.from.indexOf("www.google") >= 0) {
			//if its a google search
			var to_url = data.node.to;
			to_url = getURLFromSearch(to_url);
			data.node.to = to_url;
		} else if ($.url(data.node.to).attr('host') == "") {
			//if its just a path
			//todo CHECK #?
			console.log("ThinKS to url is jsut a path " + data.node.to);
			var from_url = $.url(data.node.from);
			var host = from_url.attr('host');
			var prot = from_url.attr('protocol') + "://";
			data.node.to = prot + host + data.node.to;
		}

		if (sender.tab != null) {
			node["id"] = sender.tab.id;
		} else {
			//Default id is 0
			node["id"] = 0;
		}

		registerNode(node);
	}
});

//Data store functions (used to debug mostly)
function saveData(){
	console.log("Saving data bb");
	chrome.storage.sync.clear();
	chrome.storage.sync.set({'nodes': node_list})
}

function getData(){

	console.log("bb give me the data");

	chrome.storage.sync.get('nodes', function(data){
		var stored_list = data.nodes;
		if (stored_list != null)
		{
			$(stored_list).each(function(i, el) {
				node_list.unshift(el);
			});
		} else {
			console.log("Chrome doesn't have any information");
		}
	
	});

}