from flask import Flask, request
import ipahttp
import json

app = Flask(__name__)

ipa_ = ipahttp.ipa('ipa2.zut.edu.pl')

@app.route("/login", methods=['POST'])
def login():
    error = None

    if request.method == 'POST' and request.is_json:
        post_data = request.get_json()
        if ipa_.login(post_data['username'],
                      post_data['password']) != None:
            return json.dumps(ipa_.user_show(post_data['username']), indent=4)
        else:
            error = 'Error reading json'
    return str(error)

@app.route("/")
def hello_world():
    return "Hello world"