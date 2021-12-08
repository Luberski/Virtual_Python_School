from flask import Flask, request, jsonify
from flask_jwt import JWT, jwt_required, current_identity
import ipahttp
import json
import user_parser as up
from werkzeug.security import safe_str_cmp


app = Flask(__name__)

ipa_ = ipahttp.ipa('ipa2.zut.edu.pl')
app.config['SECRET_KEY'] = 'super-secret'
app.debug = True

@app.route("/api/login", methods=['POST','GET'])
def login():
    error = None
    if request.method == 'POST':
        if ipa_.login(request.form['username'],
                      request.form['password']) != None:
            user = up.user(ipa_.user_show(request.form['username']))
            user.parser()
            user.check()
            return user.dicto
        else:
            error = '404 xD'
    return str(error)

def authenticate(username, password):
    return None

def identity(payload):
    #user_id = payload['identity']
    return None

jwt = JWT(app, authenticate, identity)
@app.route('/api/protected')
@jwt_required()
def protected():
    return '%s' % current_identity




app.run()
