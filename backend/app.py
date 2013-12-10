#!/usr/bin/env python

from flask import Flask, jsonify, make_response, request, abort
from JsonLogic import *
import time
import mechanize
from heapq import *
from copy import deepcopy
import json
import settings

app = Flask(__name__)
app.config.from_object('settings')

@app.route('/webshare/api/v1.0/', methods = ['GET'])
def get_graph():
    """
    API GET that will return all browsing data in JSON form (connections).
    """

    print graphs
    return format_return()

@app.route('/webshare/api/v1.0/', methods = ['POST'])
def store_new():
    """
    API POST request which stores a new link.
    """
    print request

    # Fail if request is not formatted correctly.
    if not request.json:
        print "JSON not in request"
        abort(400)

    if (not 'id' in request.json or
        not 'from' in request.json or
        not 'to' in request.json):
        abort(400)

    # Grab JSON data
    tab_id = int(request.json['id'])
    from_url = request.json['from']
    to_url = request.json['to']
    date = time.strftime("  %c")
    name = get_name(to_url)

    # Create new Node
    new_child = {
            'name': name,
            'url': to_url,
            'time': date,
            'children': []
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

@app.route('/webshare/api/v1.0/search/<string:query>', methods = ['GET'])
def get_highlighted_graph(query):
    queries = query.split(" ")
    highlighted_graph = deepcopy(graphs)


    for x, y in highlighted_graph.iteritems():
        q = []
        q.append(y)
        while len(q) != 0:
            cur = q.pop()
            print cur
           
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

    print "TITS"            
    for g in highlighted_graph.iteritems():
        print g

    to_ret = [g[1] for g in highlighted_graph.iteritems() if highlight_exists(g[1])]
    print to_ret
    return jsonify({'graph': to_ret}), 201

@app.route('/webshare/api/v1.0/new_session_from/<string:file_name>', methods = ['GET'])
def new_session_from(file_name):
    data = []
    with open (settings.ROOT + '/saved_sessions/' + file_name + '.txt', 'r') as inf:
        for line in inf:
            data.append(json.loads(line))

    global groups
    groups = data[0]['groups']
    
    global graphs
    graphs = data[0]['graphs']

    return format_return()

@app.route('/webshare/api/v1.0/save_session_as/<string:session_name>', methods = ['GET'])
def save_session(session_name):
    with open (settings.ROOT + '/saved_sessions/' + session_name + '.txt', 'w') as out:
        data = {'groups': groups, 'graphs': graphs}
        json.dump(data, out)

    return format_return()

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify( {'error': 'Not found'}), 404)

if __name__ == '__main__':
    app.run(debug = True)