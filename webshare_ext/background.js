console.log("I'm the background");
var node_list = [];
var root_ids = [];

//This function will eventually push to server
function registerNode(node){
	console.log("Pushed a new node " + node + " to server");
}

//When we create a new tab, we mark it as a tab that has been created by chrome. 
chrome.tabs.onCreated.addListener(function(tab){
	
	//TODO: Only a newtab if you go to newtab, need to make this more general?
	if (tab.url.indexOf("newtab") >= 0) {
		root_ids.push(tab.id);	
	}
});

//Then when a "newtab" is updated with some url, it acts as a root node.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if (changeInfo.status == "complete") {
		var valid = false;
		for (var i=0; i< root_ids.length; i++){
			if (root_ids[i] == tabId){
				valid = true;
			}
		}
		if (! valid ) {
			//Not a root node
			return;
		} else {
			if (tab.url.indexOf("http") >= 0 ) {
				registerNode({"from": "root", "to": tab.url, "id": tabId});
			}
		}
	}
});

//Get messages from client scripts
chrome.runtime.onMessage.addListener(function(data){
	if (data.debug != null){
		console.log(data.debug);
		return;
	}
	if (data.node != null){
		node_list.push(current_node);
		registerNode(current_node);
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