from flask import request, jsonify
from . import routes
from app import ipahttp
from app import api
from app.db import db
from app import models

ipa_ = ipahttp.ipa("ipa2.zut.edu.pl")


@routes.route("/api/login", methods=["POST"])
def login():
    error = None
    if request.method == "POST":
        if ipa_.login(request.form["username"], request.form["password"]) is not None:
            ipa_user = api.User(ipa_.user_show(request.form["username"]))
            parsed_user_data = ipa_user.parse()
            # # todo: find a better way to do this
            db.create_all()
            db.session.commit()
            # create user in database if not exists
            user = (
                models.User()
                .query.filter_by(zut_id=parsed_user_data["data"]["zutID"])
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
                return jsonify(
                    {
                        "data": {
                            "username": user.username,
                            "zutID": user.zut_id,
                            "name": user.name,
                            "lastName": user.last_name,
                            "email": user.email,
                        },
                        "error": None,
                    }
                )
            else:
                return jsonify(
                    {
                        "data": {
                            "username": user.username,
                            "zutID": user.zut_id,
                            "name": user.name,
                            "lastName": user.last_name,
                            "email": user.email,
                        },
                        "error": None,
                    }
                )
        error = "404"
    return jsonify({"error": error})
