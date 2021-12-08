import os
from flask import Flask, request, jsonify
from app.ipahttp import ipahttp
import json
from flask_jwt_extended import JWTManager
from flask_restful import Api



app = Flask(__name__)
ipa_ = ipahttp.ipa('ipa2.zut.edu.pl')

app.config['SQLALCHEMY_DATABASE_URI'] = postgresqlConfig
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = "Dese.Decent.Pups.BOOYO0OST"  # Change this!
jwt = JWTManager(app)
api = Api(app)

@app.route('/users/<int:user_id>')
def show(user_id):
    user = User.query.filter(User.id == user_id).one_or_none()
    if user is None:
        abort(404)
    else:
        return jsonify({
            'success': True,
            'user': user.format()
    })

@app.route("/login", methods=['POST'])
def login():
    error = None

    if request.method == 'POST' and request.is_json:
        post_data = request.get_json()
        if ipa_.login(post_data['username'],
                        post_data['password']) != None:
            return jsonify(ipa_.user_show(post_data['username']), indent=4)
        else:
            abort(422)
    return str(error)

@app.route("/")
def hello_world():
    return "Hello world"

app.run()