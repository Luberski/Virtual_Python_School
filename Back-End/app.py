from flask import Flask, request
import requests
import json
import logging

class ipa(object):

    def __init__(self, server, sslverify=False):
        self.server = server
        self.sslverify = sslverify
        self.log = logging.getLogger(__name__)
        self.session = requests.Session()

    def login(self, user, password):
        rv = None
        ipaurl = 'https://{0}/ipa/session/login_password'.format(self.server)
        header = {'referer': ipaurl, 'Content-Type':
                  'application/x-www-form-urlencoded', 'Accept': 'text/plain'}
        login = {'user': user, 'password': password}
        rv = self.session.post(ipaurl, headers=header, data=login,
                               verify=self.sslverify)

        if rv.status_code != 200:
            self.log.warning('Failed to log {0} in to {1}'.format(
                user,
                self.server)
            )
            rv = None
        else:
            self.log.info('Successfully logged in as {0}'.format(user))
            # set login_user for use when changing password for self
            self.login_user = user
        return rv

    def makeReq(self, pdict):
        results = None
        ipaurl = 'https://{0}/ipa'.format(self.server)
        session_url = '{0}/session/json'.format(ipaurl)
        header = {'referer': ipaurl, 'Content-Type': 'application/json',
                  'Accept': 'application/json'}

        data = {'id': 0, 'method': pdict['method'], 'params':
                [pdict['item'], pdict['params']]}

        self.log.debug('Making {0} request to {1}'.format(pdict['method'],
                        session_url))

        request = self.session.post(
                session_url, headers=header,
                data=json.dumps(data),
                verify=self.sslverify
        )
        results = request.json()

        return results


    def user_show(self, user):
        m = {'item': [user], 'method': '', 'params':
             {'all': True, 'raw': False}}
        results = self.makeReq(m)

        return results


app = Flask(__name__)

ipa_ = ipa('ipa2.zut.edu.pl')

@app.route("/login", methods=['POST','GET'])
def login():
    error = None
    if request.method == 'POST':
        if ipa_.login(request.form['username'],
                      request.form['password']) != None:
            return json.dumps(ipa_.user_show(request.form['username']), indent=4)
        else:
            error = 'POST REQUEST'
    return str(error)

@app.route("/")
def hello_world():
    return "<p>Hello world</p>"

app.run()