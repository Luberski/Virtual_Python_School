from flask import request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, create_refresh_token, get_jwt, get_jwt_identity
from . import routes
from app import ipahttp
from app import api
from app.db import db
from app import models
from app.jwt import jwt

ipa_ = ipahttp.ipa("ipa2.zut.edu.pl")



@routes.route("/api/login", methods=["POST"])
def login():
    error = None
    if request.method == "POST":
        if ipa_.login(request.form["username"], request.form["password"]) is not None:
            ipa_user = api.User(ipa_.user_show(request.form["username"]))
            parsed_user_data = ipa_user.parse()

            user = (
                models.User()
                .query.filter_by(username=parsed_user_data["data"]["zutID"])
                .first()
            )
            if user is None:
                new_user = models.User(
                    username=parsed_user_data["data"]["zutID"],
                    zut_id=parsed_user_data["data"]["zutID"],
                    name=parsed_user_data["data"]["name"],
                    last_name=parsed_user_data["data"]["lastName"],
                    email=parsed_user_data["data"]["email"],
                )
                db.session.add(new_user)
                db.session.commit()

                access_token = create_access_token(identity=new_user.username)
                refresh_token = create_refresh_token(identity=new_user.username)

                return jsonify(
                    {
                        "data": {
                            "username": new_user.username,
                            "zutID": new_user.zut_id,
                            "name": new_user.name,
                            "lastName": new_user.last_name,
                            "email": new_user.email,
                            "token" : {
                                "access_token" : access_token,
                                "refresh_token" : refresh_token,
                            },
                        },
                        "error": None,
                    }
                )
            else:
                access_token = create_access_token(identity=user.username)
                refresh_token = create_refresh_token(identity=user.username)
                return jsonify(
                    {
                        "data": {
                            "username": user.username,
                            "zutID": user.zut_id,
                            "name": user.name,
                            "lastName": user.last_name,
                            "email": user.email,
                            "token" : {
                                "access_token" : access_token,
                                "refresh_token" : refresh_token,
                            },
                        },
                        "error": None,
                    }
                )
        error = "404"
    return jsonify({"error": error})


@routes.route("/api/logout/access", methods=["POST"])
@jwt_required()
def logout_access():
    if request.method == "POST":
        jti = get_jwt()['jti']
        try:
            revoked_token = models.RevokedTokenModel(jti=jti)
            revoked_token.add()

            return jsonify({"error": None})
        except:
            return jsonify({"error": 500})


@routes.route("/api/logout/refresh", methods=["POST"])
@jwt_required(refresh=True)
def logout_refresh():
    if request.method == "POST":
        jti = get_jwt()['jti']
        try:
            revoked_token = models.RevokedTokenModel(jti=jti)
            revoked_token.add()

            return jsonify({"error": None})
        except:
            return jsonify({"error": 500})


@routes.route("/api/token/refresh", methods=["POST"])
@jwt_required(refresh=True)
def token_refresh():
    if request.method == "POST":
        current_user = get_jwt_identity()
        access_token = create_access_token(identity=current_user)
        refresh_token = create_refresh_token(identity=current_user)
        return jsonify(
                    {
                        "data": {
                            "username": user.username,
                            "token" : {
                                "access_token" : access_token,
                                "refresh_token" : refresh_token,
                            },
                        },
                        "error": None,
                    }
                )



@jwt.token_in_blocklist_loader
def check_if_token_in_blocklist(jwt_header, decrypted_token):
    jti = decrypted_token['jti']
    return models.RevokedTokenModel.is_jti_blacklisted(jti=jti)


