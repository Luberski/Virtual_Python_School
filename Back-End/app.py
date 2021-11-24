from flask import Flask, request
import ipahttp
import json

app = Flask(__name__)

ipa_ = ipahttp.ipa('ipa2.zut.edu.pl')

@app.route("/login", methods=['POST','GET'])
def login():
    error = None
    if request.method == 'POST':
        if ipa_.login(request.form['username'],
                      request.form['password']) != None:
            return json.dumps(ipa_.user_show(request.form['username']), indent=4)
        else:
            error = 'POST REQUEST'
    return str(error)

@app.route("/")
def hello_world():
    return "<p>Hello world</p>"

app.run()