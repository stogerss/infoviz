from mechanize import Browser
from heapq import *



def search(query):

	queries = query.split(" ")

	urls = ["http://imgur.com/wYaP89E", "http://www.cnn.com/2013/11/22/justice/knockout-game-teen-assaults/index.html?hpt=hp_t1"]
	matches = []
	mech = Browser()

	for url in urls:
		page = mech.open(url)
		html = page.read()
		frequency = 0
		for q in queries:
			frequency += html.count(query)
		
		if frequency > 0:
			heappush(matches, (-frequency, url))

	ret = [m[1] for m in matches]
	return ret