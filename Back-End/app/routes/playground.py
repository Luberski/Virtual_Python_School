from app import pythonRunner
from flask import request, jsonify
from . import routes


@routes.route("/api/playground", methods=["POST"])
def playground():
    if request.method == "POST":
        data = request.json
        rpr = pythonRunner.RemotePythonRunner()
        text, err = rpr.run_code(data["data"]["content"])
        if len(err) == 0:
            return jsonify({"data": {"content": text}})
        return jsonify({"error": err})
    return jsonify({"error": "400"})
