from subprocess import Popen, PIPE
from flask import jsonify

class asd:
    def run_code(code):
        bashcmd = "python -c '{data}'".format(data=code)
        pipe = Popen(bashcmd, stdout=PIPE, stderr=PIPE, shell=True)
        text = pipe.communicate()[0].decode('ascii')
        err = pipe.communicate()[1].decode('ascii')
        print(text,err)
        if(len(err) != 0):
            return jsonify({"data":{"content":text}})
        else:
            return jsonify({"error":err})