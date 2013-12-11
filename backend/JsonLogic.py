import tldextract
from urlparse import urlparse
import json
from flask import jsonify
import settings
from copy import deepcopy
import mechanize

# Tab Groupings in the form
# =========================
# {
#    '1': [1,2,3],
#    '5': [5,7,9]
#}
groups = {}

# JSON data in the format of
# ================================
# {
# "name": "Reddit",
# "url": "http://www.reddit.com",
# "time": "10:35",
# "children": []
# }
graphs = {}

def get_name(url):

    extracted = tldextract.extract(url) #tldextract is good at getting the domain and subdomain
    name = extracted.domain 
    name = name[0].upper() + name[1:]
    subdomain = extracted.subdomain
    #if subdomain != "":
        #name = subdomain + "." + name should we do this?

    extracted = urlparse(url) #urlparse is good at getting path
    path = extracted.path
    if len(path) > 1:
        if "Reddit" in name and "/r/" in path: #todo this doesn't work
            path = path.split("/")[2]
        elif "/wiki/" in path:
            path = path.split("/")[2] #because the wiki is just extraneous we want the page title
        elif path[0] == "/":
            path = path.split("/")[1]
        else:
            path = path.split("/")[0]

        name += " " + path

    return name

def seen_before(url, graph_root):
    q = []
    q.append(graph_root)
    while(len(q) != 0):
        cur = q.pop()
        if cur['url'] == url:
            return True
        for child in cur['children']:
            q.append(child)

    return False

def find_group(tab_id, node, parent_url):
    """
    Searches through 'groups' dictionary for the correct tab grouping.
    If it is a new ID, find its appropriate parent, append it, and return.

    Returns a string of the group.
    """
    for x, y in groups.iteritems():
        if tab_id in y:
            return x

    for x, y in graphs.iteritems():
        q = []
        q.append(y)
        while len(q) != 0:
            cur = q.pop()
            if cur['url'] == parent_url:
                groups[x].append(tab_id)
                return x
            for child in cur['children']:
                q.append(child)
    
    return None

def format_return():
    """
    Self explanatory.
    """
    to_ret = [g[1] for g in graphs.iteritems()]
    return jsonify({'graph': to_ret}), 201

def update_json(new_child, parent_url, graph_root):
    q = []
    q.append(graph_root)
    while len(q) != 0:
        cur = q.pop()
        if cur['url'] == parent_url:
            cur['children'].append(new_child)
            return
        for child in cur['children']:
            q.append(child)

def highlight_exists(graph_root):
    q = []
    q.append(graph_root)
    while len(q) != 0:
        cur = q.pop()
        if 'count' in cur and cur['count']:
            return True
        for child in cur['children']:
            q.append(child)

    return False

def save_session_as_handler(session_name):
    with open (settings.ROOT + '/saved_sessions/' + session_name + '.txt', 'w') as out:
        global groups
        global graphs
        data = {'groups': groups, 'graphs': graphs}
        json.dump(data, out)

    return format_return()

def new_session_from_handler(session_name):
    data = []
    with open (settings.ROOT + '/saved_sessions/' + session_name + '.txt', 'r') as inf:
        for line in inf:
            data.append(json.loads(line))

    global groups
    groups = data[0]['groups']
    
    global graphs
    graphs = data[0]['graphs']

    return format_return()

def store_new_handler(tab_id, from_url, to_url, date, name, title):
    # Create new Node
    new_child = {
            'name': name,
            'url': to_url,
            'time': date,
            'children': [],
            'title': title
            }

    # New Tab Situation
    if (from_url == "root"):
        groups[str(tab_id)] = [tab_id]
        graphs[str(tab_id)] = new_child
        return format_return()

    # Moving through the same site.
    if (get_name(to_url) == name):
        name = ""

    # Find which graph this belongs to.
    group = find_group(tab_id, new_child, from_url)

    # If I've seen this node, do nothing, else add in.
    if not seen_before(to_url, graphs[group]):
        update_json(new_child, from_url, graphs[group])

    return format_return()

def get_highlighted_graph_handler(query):
    queries = query.split(" ")
    highlighted_graph = deepcopy(graphs)


    for x, y in highlighted_graph.iteritems():
        q = []
        q.append(y)
        while len(q) != 0:
            cur = q.pop()
           
            try:
                browser = mechanize.Browser()
                browser.set_handle_robots(False)
                page = browser.open(cur['url'])
                html = page.read()
                html = html.decode('utf-8')
                frequency = 0
                for x in queries:
                    frequency = html.count(x)
                if frequency > 0:
                    cur['count'] = frequency
                for child in cur['children']:
                    q.append(child)
            except:
                url = cur['url']
                for x in queries:
                    if x in url:
                        cur['count']  = 1
                #name = cur['name']
                for child in cur['children']:
                    q.append(child)

    to_ret = [g[1] for g in highlighted_graph.iteritems() if highlight_exists(g[1])]
    return jsonify({'graph': to_ret}), 201