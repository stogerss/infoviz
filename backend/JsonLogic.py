import tldextract
from urlparse import urlparse
import json
from flask import jsonify

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
global graphs
graphs = {}

def get_name(url):

    extracted = tldextract.extract(url) #tldextract is good at getting the domain and subdomain
    print extracted
    name = extracted.domain 
    name = name[0].upper() + name[1:]
    subdomain = extracted.subdomain
    #if subdomain != "":
        #name = subdomain + "." + name should we do this?

    extracted = urlparse(url) #urlparse is good at getting path
    path = extracted.path
    if len(path) > 1:
        if "/wiki/" in path or "/reddit/r/" in path:
            path = path.split("/")[2] #because the wiki is just extraneous we want the page title
        if path[0] == "/":
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

    print graphs

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
