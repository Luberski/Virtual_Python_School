from app import pythonRunner
from flask import request, jsonify, make_response
from . import routes

@routes.route("/api/playground", methods=["POST"])
def playground():
    data = request.json
    rpr = pythonRunner.RemotePythonRunner()
    text, err = rpr.run_code(data["data"]["content"])
    if len(err) == 0:
        return make_response(jsonify({"data": {"content": text}}), 200)
    return make_response(jsonify({"error": err}), 200)
