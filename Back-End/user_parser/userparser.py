import json
import sqlalchemy as salsa
from sqlalchemy import engine
from sqlalchemy import inspect
from flask import Flask, jsonify
from flask_jwt import JWT, jwt_required, current_identity


class user:
    def __init__(self,json_dump):
        self.json_dump = json_dump

    def parser(self):
        mail = self.json_dump["principal"]
        imie_nazwisko = self.json_dump["result"]["result"]["displayname"][0]
        imie = imie_nazwisko.split(" ")[0]
        nazwisko = imie_nazwisko.split(" ")[-1]
        zutID = self.json_dump["result"]["value"]
        #generate JWT

        #jwt = JWT(app, zutID, 1)
        #print('%s' % current_identity)

        self.dicto = {
            "data": {
                "email": mail,
                "name": imie,
                "lastName": nazwisko,
                "zutID": zutID,
                "token": None
            },
                "error": None
            }


        self.dicto = jsonify(self.dicto)
        #self.dicto = self.dicto
    
    def check(self):
        self.base = salsa.create_engine('mysql+pymysql://root:root@virtualschool.wi.zut.edu.pl/Virtual_Python_School')
        print(inspect(self.base))
        #print(con.execute("SELECT * FROM users"))



