import tldextract
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
graphs = {}

# Current IP Address
session = "The fuck"

def get_name(url):
    extracted = tldextract.extract(url)
    name = extracted.domain
    name = name[0].upper() + name[1:]
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

def check_new_ip(current_ip):
    """
    Resets IP
    """
    if current_ip != session:
        global session
        session = current_ip
        graphs = {}
        groups = {}