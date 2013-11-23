console.log("IM HERE!");

//$("body").css("background-color", "pink");

$('a').live('mousedown',function(){
	var x = $(this).attr('href');
	var pathname = window.location.href;
	var tuple = [pathname, x];
	//alert(tuple);
	chrome.runtime.sendMessage({node: tuple})
	//window.location.href plz no
});
