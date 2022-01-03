from flask import Flask, request, jsonify

from app import ipahttp
from app import api
import app.pythonRunner as PR

app = Flask(__name__)
ipa_ = ipahttp.ipa("ipa2.zut.edu.pl")


@app.route("/api/playground", methods=["POST"])
def playground():
    if request.method == "POST":
        data = request.json
        remote_python_runner = PR.RemotePythonRunner()
        text, err = remote_python_runner.run_code(data["data"]["content"])
        if len(err) == 0:
            return jsonify({"data": {"content": text}})
        return jsonify({"error": err})
    return jsonify({"error": "400"})


@app.route("/api/login", methods=["POST"])
def login():
    error = None
    if request.method == "POST":
        if ipa_.login(request.form["username"], request.form["password"]) is not None:
            user = api.User(ipa_.user_show(request.form["username"]))
            parsed_user_data = user.parse()
            return jsonify(parsed_user_data)
        error = "404"
    return jsonify({"error": error})


if __name__ == "__main__":
    app.config["SECRET_KEY"] = "super-secret"
    app.run()
