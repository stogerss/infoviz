//This function is the mouseclick tracker.
$('a').live('mousedown',function(){
	var x = $(this).attr('href');
	var pathname = window.location.href;
	var tuple = {"from":pathname, "to": x};
	//alert(tuple);
	chrome.runtime.sendMessage({node: tuple})
	//window.location.href plz no
});
