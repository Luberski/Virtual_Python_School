from flask import Flask, request
import ipahttp
import json
import user_parser as up

app = Flask(__name__)

ipa_ = ipahttp.ipa('ipa2.zut.edu.pl')

@app.route("/api/login", methods=['POST','GET'])
def login():
    error = None
    if request.method == 'POST':
        if ipa_.login(request.form['username'],
                      request.form['password']) != None:
            json_dump = ipa_.user_show(request.form['username'])
            tst = up.user(json_dump)
            tst.parser()
            tst.check()
            return json_dump

        else:
            error = 'POST REQUEST'
    return str(error)


app.run()
