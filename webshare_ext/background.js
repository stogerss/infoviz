console.log("I'm the background");
var node_list = [];
var current_node;

//On a new tab create, we don't run the usual content script but a baby one
chrome.tabs.onRemoved.addListener(function(tab){
	chrome.tabs.executeScript(null, {file: "newtab_tracker.js"});	
});

//Get messages from client scripts
chrome.runtime.onMessage.addListener(function(data){
	
	if (data.debug != null){
		console.log(data.debug);
		return;
	}

	if (data.node != null){
		current_node = data.node;
		console.log(current_node[0], " to ", current_node[1]);
		node_list.push(current_node);	
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