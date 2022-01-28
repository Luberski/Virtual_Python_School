from flask import request, jsonify, make_response
from flask_jwt_extended import (
    jwt_required,
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
)
from . import routes
from app import ipahttp
from app import api
from app.db import db
from app import models
from app.jwt import jwt

# todo: switch between ipa2 and ipa1 if one of them is not available
ipa_ = ipahttp.ipa("ipa2.zut.edu.pl")


@routes.route("/api/login", methods=["POST"])
def login():
    # todo: return error if ipa is not responding
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

            return make_response(
                jsonify(
                    {
                        "data": {
                            "username": new_user.username,
                            "zutID": new_user.zut_id,
                            "name": new_user.name,
                            "lastName": new_user.last_name,
                            "email": new_user.email,
                            "token": {
                                "access_token": access_token,
                                "refresh_token": refresh_token,
                            },
                        },
                        "error": None,
                    }
                ),
                201,
            )
        else:
            access_token = create_access_token(identity=user.username)
            refresh_token = create_refresh_token(identity=user.username)
            return make_response(
                jsonify(
                    {
                        "data": {
                            "username": user.username,
                            "zutID": user.zut_id,
                            "name": user.name,
                            "lastName": user.last_name,
                            "email": user.email,
                            "token": {
                                "access_token": access_token,
                                "refresh_token": refresh_token,
                            },
                        },
                        "error": None,
                    }
                ),
                200,
            )
    return jsonify({"error": "Bad credentials"}), 401


@routes.route("/api/logout/access", methods=["POST"])
@jwt_required()
def logout_access():
    jti = get_jwt()["jti"]
    try:
        revoked_token = models.RevokedTokenModel(jti=jti)
        revoked_token.add()

        return make_response(jsonify({"error": None}), 200)
    except:
        return make_response(jsonify({"error": "Cannot logout user properly"}), 403)


@routes.route("/api/logout/refresh", methods=["POST"])
@jwt_required(refresh=True)
def logout_refresh():
    jti = get_jwt()["jti"]
    try:
        revoked_token = models.RevokedTokenModel(jti=jti)
        revoked_token.add()

        return make_response(jsonify({"error": None}), 200)
    except:
        return make_response(jsonify({"error": "Cannot logout user properly"}), 403)


@routes.route("/api/token/refresh", methods=["POST"])
@jwt_required(refresh=True)
def token_refresh():
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    refresh_token = create_refresh_token(identity=current_user)
    jti = get_jwt()["sub"]
    # todo: add check if identity is wrong and return error
    return make_response(
        jsonify(
            {
                "data": {
                    "username": jti,
                    "token": {
                        "access_token": access_token,
                        "refresh_token": refresh_token,
                    },
                },
                "error": None,
            }
        ),
        200,
    )


@jwt.token_in_blocklist_loader
def check_if_token_in_blocklist(jwt_header, decrypted_token):
    jti = decrypted_token["jti"]
    return models.RevokedTokenModel.is_jti_blacklisted(jti=jti)

