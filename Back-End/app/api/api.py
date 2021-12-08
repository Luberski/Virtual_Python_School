import json
import sqlalchemy as salsa
from sqlalchemy import engine
from sqlalchemy import inspect
from flask import jsonify


class user:
    def __init__(self,json_dump):
        self.json_dump = json_dump
    
    def parser(self):
        mail = self.json_dump["principal"]
        imie_nazwisko = self.json_dump["result"]["result"]["displayname"][0]
        imie = imie_nazwisko.split(" ")[0]
        nazwisko = imie_nazwisko.split(" ")[-1]
        zutid = self.json_dump["result"]["value"]
        self.dicto = {
                "Mail": mail,
                "Imie": imie,
                "Nazwisko": nazwisko,
                "ZutID": zutid
            }
        self.dicto = jsonify(self.dicto)
        
    
    def check(self):
        self.base = salsa.create_engine('mysql+pymysql://root:root@virtualschool.wi.zut.edu.pl/Virtual_Python_School')
        print(inspect(self.base))