#!/usr/bin/env python

from flask import Flask, jsonify, make_response, request, abort
from JsonLogic import *
import datetime

app = Flask(__name__)
app.config.from_object('settings')

@app.route('/webshare/api/v1.0/', methods = ['GET'])
def get_graph():
    """
    API GET that will return all browsing data in JSON form (connections).
    """
    return format_return()

@app.route('/webshare/api/v1.0/', methods = ['POST'])
def store_new():
    """
    API POST request which stores a new link.
    """
    # Fail if request is not formatted correctly.
    if (not request.json or 
        not 'id' in request.json or
        not 'from' in request.json or
        not 'to' in request.json):
        abort(400)

    # Grab JSON data
    tab_id = int(request.json['id'])
    from_url = request.json['from']
    to_url = request.json['to']
    time = str(datetime.datetime.now().time())[:8]
    name = get_name(to_url)

    # Create new Node
    new_child = {
            'name': name,
            'url': to_url,
            'time': time,
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
    # TODO
    pass


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify( {'error': 'Not found'}), 404)

if __name__ == '__main__':
    app.run(debug = True)