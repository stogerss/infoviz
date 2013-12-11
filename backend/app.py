#!/usr/bin/env python

from flask import Flask, jsonify, make_response, request, abort
from JsonLogic import *
import time
from heapq import *
import json
import settings

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
    if ("title" in request.json):
        title = request.json['title']
    else:
        title = ""

    return store_new_handler(tab_id, from_url, to_url, date, name, title)

@app.route('/webshare/api/v1.0/search/<string:query>', methods = ['GET'])
def get_highlighted_graph(query):
    return get_highlighted_graph_handler(query)

@app.route('/webshare/api/v1.0/new_session_from/<string:session_name>', methods = ['GET'])
def new_session_from(session_name):
    return new_session_from_handler(session_name)

@app.route('/webshare/api/v1.0/save_session_as/<string:session_name>', methods = ['GET'])
def save_session_as(session_name):
    return save_session_as_handler(session_name)

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify( {'error': 'Not found'}), 404)

if __name__ == '__main__':
    app.run(debug = True)