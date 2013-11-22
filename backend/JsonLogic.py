import tldextract
import json

class JsonLogic:

	def __init__(self):
		self.seenBefore = {}
		self.json = {}

	def push(self, urlA, urlB, time):
		if urlB in self.seenBefore:
			return self.json  # shouldn't update front end though

		self.seenBefore[urlB] = 1

		new_child = {}
		new_child["name"] = self.get_name(urlB)
		new_child["time"] = time
		new_child["url"] = urlB
		new_child["children"] = []
		
		if(urlA==""):
			self.json = new_child
		else:
			self.update_json(new_child, urlA)

	def update_json(self, new_child, parent_url):
		# find parent in json
		# add to children elements
		q = []
		q.append(self.json)
		while(len(q) != 0):
			cur = q.pop()
			if (cur["url"] == parent_url):
				cur["children"].append(new_child)
				return
			for child in cur["children"]:
				q.append(child)


	def get_json(self):
		return json.dumps(self.json)

	def get_name(self, url):
		extracted = tldextract.extract(url)
		name = extracted.domain
		name = name[0].upper() + name[1:]
		return name

	def display(self):
		print("======")
		print(self.json)